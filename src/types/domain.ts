export const BusinessDomainType = {
  Legacy: 0,
  Clinic: 1,
  IndependentDoctor: 2,
  Restaurant: 3,
  RealEstateOffice: 4,
  PropertyOwner: 5,
} as const

export type BusinessDomainTypeId = (typeof BusinessDomainType)[keyof typeof BusinessDomainType]

export interface BusinessDomainMeta {
  id: number
  name: string
}
