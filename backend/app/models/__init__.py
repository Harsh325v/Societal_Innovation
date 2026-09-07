# load all models so sqlalchemy knows about every relationship

from app.models.user import User
from app.models.challenge import Challenge
from app.models.challenge_ai_analysis import ChallengeAIAnalysis

from app.models.hei import HEI
from app.models.hei_department import HEIDepartment
from app.models.domain import Domain
from app.models.hei_expertise import HEIExpertise

from app.models.faculty import Faculty
from app.models.faculty_expertise import FacultyExpertise

from app.models.challenge_hei_match import ChallengeHEIMatch
from app.models.industry_collaboration import IndustryCollaboration