export type UserProfile = {
  id: string
  email: string
  displayName: string
  phone?: string
  state?: string
  joinedAt?: string
}

export type EmergencyContact = {
  id: string
  name: string
  phone: string
  relationship: string
}
