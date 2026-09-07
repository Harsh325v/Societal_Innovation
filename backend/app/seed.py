from app.core.database import SessionLocal
from app.models.domain import Domain
from app.models.hei import HEI
from app.models.hei_department import HEIDepartment
from app.models.hei_expertise import HEIExpertise
from app.models.faculty import Faculty
from app.models.faculty_expertise import FacultyExpertise


db = SessionLocal()


def seed_data():
    # don't create everything again if demo data already exists
    if db.query(HEI).count() > 0:
        print("Demo HEI data already exists.")
        return

    # create the domains our matching engine understands
    domains = [
        Domain(name="Agriculture", description="Agricultural technology and farming"),
        Domain(name="Healthcare", description="Healthcare and medical services"),
        Domain(name="Education", description="Education and learning"),
        Domain(name="Water Management", description="Water supply and management"),
        Domain(name="Environment", description="Environmental protection"),
    ]

    db.add_all(domains)
    db.commit()

    # refresh so we get their database IDs
    for domain in domains:
        db.refresh(domain)

    # create a few demo HEIs
    heis = [
        HEI(
            name="Birla Institute of Technology",
            code="BIT-MESRA",
            description="Engineering and technology focused higher education institution",
            district="Ranchi",
            infrastructure="Engineering laboratories, innovation centre, research facilities",
            website="https://www.bitmesra.ac.in",
        ),
        HEI(
            name="National Institute of Technology Jamshedpur",
            code="NIT-JSR",
            description="Engineering and technology research institution",
            district="East Singhbhum",
            infrastructure="Engineering labs, research centres, computing facilities",
            website="https://www.nitjsr.ac.in",
        ),
        HEI(
            name="Birsa Agricultural University",
            code="BAU",
            description="Agricultural research and education institution",
            district="Ranchi",
            infrastructure="Agricultural research farms, soil labs, irrigation research facilities",
            website="https://www.bauranchi.org",
        ),
    ]

    db.add_all(heis)
    db.commit()

    for hei in heis:
        db.refresh(hei)

    # create departments
    departments = [
        HEIDepartment(
            hei_id=heis[0].id,
            name="Department of Computer Science",
            description="Computer science and software engineering",
        ),
        HEIDepartment(
            hei_id=heis[1].id,
            name="Department of Civil Engineering",
            description="Infrastructure and water-related engineering",
        ),
        HEIDepartment(
            hei_id=heis[2].id,
            name="Department of Agricultural Engineering",
            description="Agricultural technology and irrigation",
        ),
    ]

    db.add_all(departments)
    db.commit()

    # create HEI expertise
    expertise = [
        HEIExpertise(
            hei_id=heis[0].id,
            domain_id=domains[2].id,
            expertise_level=4,
        ),
        HEIExpertise(
            hei_id=heis[1].id,
            domain_id=domains[3].id,
            expertise_level=5,
        ),
        HEIExpertise(
            hei_id=heis[1].id,
            domain_id=domains[4].id,
            expertise_level=4,
        ),
        HEIExpertise(
            hei_id=heis[2].id,
            domain_id=domains[0].id,
            expertise_level=5,
        ),
        HEIExpertise(
            hei_id=heis[2].id,
            domain_id=domains[3].id,
            expertise_level=4,
        ),
    ]

    db.add_all(expertise)
    db.commit()

    for entry in expertise:
        db.refresh(entry)

    # create faculty
    faculty = [
        Faculty(
            hei_id=heis[0].id,
            department_id=departments[0].id,
            name="Dr. Ananya Sharma",
            designation="Professor",
            expertise="Educational technology and computer science",
        ),
        Faculty(
            hei_id=heis[1].id,
            department_id=departments[1].id,
            name="Dr. Rajesh Kumar",
            designation="Professor",
            expertise="Water resources and infrastructure",
        ),
        Faculty(
            hei_id=heis[2].id,
            department_id=departments[2].id,
            name="Dr. Priya Singh",
            designation="Professor",
            expertise="Agricultural engineering and irrigation",
        ),
    ]

    db.add_all(faculty)
    db.commit()

    for member in faculty:
        db.refresh(member)

    # connect faculty members to their domains
    faculty_expertise = [
        FacultyExpertise(
            faculty_id=faculty[0].id,
            domain_id=domains[2].id,
            expertise_level=4,
        ),
        FacultyExpertise(
            faculty_id=faculty[1].id,
            domain_id=domains[3].id,
            expertise_level=5,
        ),
        FacultyExpertise(
            faculty_id=faculty[2].id,
            domain_id=domains[0].id,
            expertise_level=5,
        ),
    ]

    db.add_all(faculty_expertise)
    db.commit()

    print("Demo HEI data created successfully.")


try:
    seed_data()
finally:
    db.close()