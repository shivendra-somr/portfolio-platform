export interface Social {
  label: string
  url: string
  icon: 'github' | 'linkedin' | 'globe' | 'mail' | 'x'
}

export interface Profile {
  name: string
  headline: string
  tagline: string
  location: string
  email: string
  phone: string
  showPhone: boolean
  yearsOfExperience: string
  availableForWork: boolean
  summary: string
  highlights: { value: string; label: string }[]
  resumeUrl: string
  socials: Social[]
}

export interface SkillGroup {
  category: string
  items: string[]
}

export interface Experience {
  id: string
  role: string
  company: string
  companyUrl: string
  location: string
  startDate: string
  endDate: string | null
  current: boolean
  summary: string
  highlights: string[]
  tech: string[]
}

export interface Project {
  id: string
  title: string
  subtitle: string
  category: string
  featured: boolean
  url: string
  repoUrl: string
  image: string
  description: string
  metrics?: { value: string; label: string }[]
  highlights: string[]
  tech: string[]
}

export interface Education {
  degree: string
  institution: string
  startDate: string
  endDate: string
}

export interface Certification {
  title: string
  issuer: string
  url: string
}

export interface SiteConfig {
  title: string
  description: string
  siteUrl: string
  nav: { label: string; path: string }[]
}
