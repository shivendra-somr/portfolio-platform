// Single entry point for all JSON-driven portfolio content.
// Edit the files in src/static-data/ to change what the site shows.
import profileJson from '../static-data/profile.json'
import skillsJson from '../static-data/skills.json'
import experienceJson from '../static-data/experience.json'
import projectsJson from '../static-data/projects.json'
import educationJson from '../static-data/education.json'
import certificationsJson from '../static-data/certifications.json'
import siteJson from '../static-data/site.json'
import type {
  Certification, Education, Experience, Profile, Project, SiteConfig, SkillGroup,
} from '../types/portfolio'

export const profile = profileJson as Profile
export const skills = skillsJson as SkillGroup[]
export const experience = experienceJson as Experience[]
export const projects = projectsJson as Project[]
export const education = educationJson as Education[]
export const certifications = certificationsJson as Certification[]
export const site = siteJson as SiteConfig

export const featuredProjects = projects.filter((p) => p.featured)
