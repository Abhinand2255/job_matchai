from django.core.management.base import BaseCommand
from candidates.models import Skill, SkillCategory


SKILLS_DATA = [
    # Frontend
    ('React', SkillCategory.FRONTEND, 'react.js,reactjs'),
    ('JavaScript', SkillCategory.FRONTEND, 'js,es6,es2020'),
    ('TypeScript', SkillCategory.FRONTEND, 'ts'),
    ('HTML5', SkillCategory.FRONTEND, 'html'),
    ('CSS3', SkillCategory.FRONTEND, 'css'),
    ('Tailwind CSS', SkillCategory.FRONTEND, 'tailwind,tailwindcss'),
    ('Vue.js', SkillCategory.FRONTEND, 'vue,vuejs'),
    ('Angular', SkillCategory.FRONTEND, 'angularjs,angular 2+'),
    ('Next.js', SkillCategory.FRONTEND, 'nextjs'),
    ('Redux', SkillCategory.FRONTEND, 'redux toolkit,rtk'),
    ('Bootstrap', SkillCategory.FRONTEND, 'bootstrap 5'),

    # Backend
    ('Python', SkillCategory.BACKEND, 'py,python3'),
    ('Django', SkillCategory.BACKEND, 'django rest framework,drf'),
    ('FastAPI', SkillCategory.BACKEND, 'fast api'),
    ('Flask', SkillCategory.BACKEND, ''),
    ('Node.js', SkillCategory.BACKEND, 'nodejs,node'),
    ('Express.js', SkillCategory.BACKEND, 'express,expressjs'),
    ('Java', SkillCategory.BACKEND, 'java 17,java 21,core java'),
    ('Spring Boot', SkillCategory.BACKEND, 'spring,springboot'),
    ('Go', SkillCategory.BACKEND, 'golang'),
    ('C#', SkillCategory.BACKEND, 'csharp,c sharp'),
    ('.NET', SkillCategory.BACKEND, 'dotnet,asp.net,.net core'),
    ('PHP', SkillCategory.BACKEND, ''),
    ('Laravel', SkillCategory.BACKEND, ''),
    ('Ruby on Rails', SkillCategory.BACKEND, 'rails,ruby'),

    # Database
    ('MySQL', SkillCategory.DATABASE, 'mysql server'),
    ('PostgreSQL', SkillCategory.DATABASE, 'postgres,psql'),
    ('MongoDB', SkillCategory.DATABASE, 'mongo'),
    ('Redis', SkillCategory.DATABASE, 'redis cache'),
    ('SQLite', SkillCategory.DATABASE, 'sqlite3'),
    ('Elasticsearch', SkillCategory.DATABASE, 'elastic search,elk'),

    # Cloud & DevOps
    ('Docker', SkillCategory.CLOUD_DEVOPS, 'docker container'),
    ('Kubernetes', SkillCategory.CLOUD_DEVOPS, 'k8s'),
    ('AWS', SkillCategory.CLOUD_DEVOPS, 'amazon web services,ec2,s3,lambda'),
    ('Azure', SkillCategory.CLOUD_DEVOPS, 'microsoft azure'),
    ('Google Cloud', SkillCategory.CLOUD_DEVOPS, 'gcp,google cloud platform'),
    ('Git', SkillCategory.CLOUD_DEVOPS, 'github,gitlab,git version control'),
    ('CI/CD', SkillCategory.CLOUD_DEVOPS, 'github actions,jenkins,continuous integration'),
    ('Linux', SkillCategory.CLOUD_DEVOPS, 'ubuntu,debian,centos,bash'),
    ('Terraform', SkillCategory.CLOUD_DEVOPS, 'iac'),

    # AI & ML
    ('Machine Learning', SkillCategory.AI_ML, 'ml'),
    ('Deep Learning', SkillCategory.AI_ML, 'dl,neural networks'),
    ('Natural Language Processing', SkillCategory.AI_ML, 'nlp,text mining'),
    ('PyTorch', SkillCategory.AI_ML, 'torch'),
    ('TensorFlow', SkillCategory.AI_ML, 'tf,keras'),
    ('Scikit-learn', SkillCategory.AI_ML, 'sklearn'),
    ('Pandas', SkillCategory.AI_ML, ''),
    ('NumPy', SkillCategory.AI_ML, ''),
    ('Large Language Models', SkillCategory.AI_ML, 'llm,llms,generative ai,genai'),

    # Mobile
    ('React Native', SkillCategory.MOBILE, 'rn'),
    ('Flutter', SkillCategory.MOBILE, 'dart'),
    ('Swift', SkillCategory.MOBILE, 'ios swift'),
    ('Kotlin', SkillCategory.MOBILE, 'android kotlin'),

    # Testing & QA
    ('PyTest', SkillCategory.TESTING, 'pytest'),
    ('Jest', SkillCategory.TESTING, ''),
    ('Selenium', SkillCategory.TESTING, 'selenium webdriver'),
    ('Cypress', SkillCategory.TESTING, ''),
]


class Command(BaseCommand):
    help = "Seeds initial technical skills catalog for JobMatch AI"

    def handle(self, *args, **options):
        created_count = 0
        for name, category, aliases in SKILLS_DATA:
            skill, created = Skill.objects.get_or_create(
                name=name,
                defaults={'category': category, 'aliases': aliases}
            )
            if created:
                created_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully seeded skills catalog: {created_count} new skills added ({len(SKILLS_DATA)} total available)."
            )
        )
