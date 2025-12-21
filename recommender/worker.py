import os
import json
import time
import datetime
import redis
from pymongo import MongoClient
from dotenv import load_dotenv
from bson.objectid import ObjectId

from core.preprocessing import DataPreprocessor
from core.skill_similarity import SkillSimilarityCalculator
from core.resource_ranker import ResourceRanker

# Load env vars
# Load env vars
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

# Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/optima_idp")
QUEUE_NAME = "recommendation_queue"

# Initialize Services
redis_client = redis.from_url(REDIS_URL)
mongo_client = MongoClient(MONGO_URI)
db = mongo_client.get_database() # Uses database from URI

preprocessor = DataPreprocessor()
similarity_calculator = SkillSimilarityCalculator()
resource_ranker = ResourceRanker()

def process_job(job_data):
    """
    Process a recommendation job.
    1. Fetch data from MongoDB (User, IDP, Skills, Resources)
    2. Generate recommendations
    3. Update IDP in MongoDB
    """
    try:
        user_id = job_data.get('userId')
        idp_id = job_data.get('idpId')
        
        print(f"Processing job for User: {user_id}, IDP: {idp_id}")
        
        # 1. Fetch Data
        user = db.users.find_one({"_id": ObjectId(user_id)})
        idp = db.idps.find_one({"_id": ObjectId(idp_id)})
        all_skills = list(db.skills.find({}))
        # Fetch resources (PyMongo doesn't have populate like Mongoose)
        # Resources should have skill reference stored as ObjectId or embedded object
        all_resources = list(db.resources.find({}))
        
        # Enrich resources with skill data if needed
        # If resources only have skill IDs, we can populate them manually
        skill_map = {str(skill['_id']): skill for skill in all_skills}
        for resource in all_resources:
            skill_ref = resource.get('skill')
            if skill_ref and isinstance(skill_ref, ObjectId):
                # If skill is just an ObjectId, replace with full skill object
                skill_id_str = str(skill_ref)
                if skill_id_str in skill_map:
                    resource['skill'] = skill_map[skill_id_str]
        
        if not user or not idp:
            print("User or IDP not found")
            return

        # 2. Prepare Inputs
        user_skills = user.get('skills', [])
        skills_to_improve = []
        
        # Extract goals from IDP
        for goal in idp.get('goals', []):
            skills_to_improve.append({
                'skillId': str(goal.get('skill')),
                'gap': 0.5, # Default gap if not calculated
                'currentLevel': 1,
                'targetLevel': 5
            })
            
        # 3. Run Recommendation Pipeline
        # a. Skill Mapping
        skill_mapping = preprocessor.create_skill_mapping(all_skills)
        
        # b. Similarity Matrix (using Embeddings now)
        similarity_matrix = similarity_calculator.build_similarity_matrix(all_skills)
        
        # c. Resource Features
        resource_features = preprocessor.prepare_resource_features(all_resources)
        
        # d. Rank Resources
        ranked_resources = resource_ranker.rank_resources(
            resources=all_resources,
            user_skills=user_skills,
            skills_to_improve=skills_to_improve,
            resource_features=resource_features,
            similarity_matrix=similarity_matrix,
            skill_to_idx=skill_mapping
        )
        
        # 4. Format and Update IDP
        top_recommendations = ranked_resources[:10]
        formatted_recs = []
        
        for item in top_recommendations:
            res = item['resource']
            formatted_recs.append({
                'resource': res['_id'], # Reference to Resource
                'score': item['score'],
                'reason': item['breakdown'].get('reason', 'Recommended based on your goals')
            })
            
        # Update IDP status and recommendations
        db.idps.update_one(
            {"_id": ObjectId(idp_id)},
            {
                "$set": {
                    "suggestedResources": formatted_recs,
                    "status": "active", # Or whatever status indicates ready
                    "updatedAt": datetime.datetime.utcnow()
                }
            }
        )
        
        print(f"Job completed for IDP: {idp_id}")
        
    except Exception as e:
        print(f"Error processing job: {e}")
        # Optionally update IDP status to 'failed'

def start_worker():
    """
    Reliable Worker with Crash Recovery
    =====================================
    
    This worker implements the "Reliable Queue" pattern using Redis BRPOPLPUSH.
    
    WHY THIS MATTERS:
    -----------------
    If we just use BLPOP (pop and process), we have a race condition:
    1. Job is popped from queue
    2. Worker crashes before completing the job
    3. Job is lost forever
    
    THE SOLUTION - The "Loop":
    ---------------------------
    Instead of popping, we use BRPOPLPUSH which atomically:
    1. Pops job from main queue
    2. Pushes it to a "processing" queue
    3. Only after success, we remove it from processing queue
    
    If the worker crashes mid-job, the job stays in the processing queue
    and can be recovered or retried.
    
    FLOW:
    -----
    recommendation_queue          recommendation_queue:processing
    [job3, job2, job1]      →     [job1]  ← Being processed
         ↓ BRPOPLPUSH              ↓ LREM (after success)
    [job3, job2]                  []  ← Job complete, removed
    """
    
    # Name of our backup/processing queue
    PROCESSING_QUEUE = f"{QUEUE_NAME}:processing"
    
    print(f"🚀 Worker started successfully!")
    print(f"📬 Listening on queue: {QUEUE_NAME}")
    print(f"🔄 Processing queue: {PROCESSING_QUEUE}")
    print(f"💾 Using Redis: {REDIS_URL}")
    print("-" * 60)
    
    while True:
        try:
            # ============================================================
            # STEP 1: ATOMIC POP & PUSH (The "Loop")
            # ============================================================
            # BRPOPLPUSH blocks until a job is available, then atomically:
            # - Removes job from the RIGHT of QUEUE_NAME (FIFO order)
            # - Pushes job to the LEFT of PROCESSING_QUEUE
            # - Returns the job data
            #
            # timeout=0 means block indefinitely until a job arrives
            job_json_bytes = redis_client.brpoplpush(
                QUEUE_NAME, 
                PROCESSING_QUEUE, 
                timeout=0
            )
            
            # If we get here, we have a job safely in the processing queue
            if job_json_bytes:
                job_json = job_json_bytes.decode('utf-8')
                job = json.loads(job_json)
                
                # Log job details
                user_id = job.get('data', {}).get('userId', 'unknown')
                idp_id = job.get('data', {}).get('idpId', 'unknown')
                print(f"\n✅ Job received - User: {user_id}, IDP: {idp_id}")
                
                # ============================================================
                # STEP 2: DO THE WORK
                # ============================================================
                # The job is now safely in the processing queue.
                # Even if we crash here, we won't lose the job.
                start_time = time.time()
                process_job(job.get('data'))
                elapsed = time.time() - start_time
                
                print(f"⏱️  Processing completed in {elapsed:.2f}s")
                
                # ============================================================
                # STEP 3: CLEANUP - Remove from Processing Queue
                # ============================================================
                # LREM removes the first occurrence of the value from the list
                # Args: (key, count, value)
                #   - count=1: remove first 1 occurrence from LEFT side
                #   - count=-1: remove first 1 occurrence from RIGHT side
                #   - count=0: remove ALL occurrences
                redis_client.lrem(PROCESSING_QUEUE, 1, job_json)
                
                print(f"🎉 Job completed and removed from processing queue")
                print("-" * 60)
                
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in job: {e}")
            # Malformed job - remove it to avoid infinite loop
            try:
                redis_client.lrem(PROCESSING_QUEUE, 1, job_json_bytes.decode('utf-8'))
            except:
                pass
            
        except Exception as e:
            print(f"⚠️  Worker Loop Error: {e}")
            print(f"💡 Job remains in processing queue for recovery")
            # Wait before retrying to avoid rapid failure loops
            time.sleep(1)

if __name__ == "__main__":
    start_worker()
