import { House } from "@/core/domain/housing/entities/House"
import { Resident } from "@/core/domain/housing/entities/Resident"

export function assertHouseExists(house: House | null): asserts house is House {
    if (!house) throw new Error("House not found.", { cause: "HOUSE_NOT_FOUND" })
}

export function assertHouseIsNotArchived(house: House): void {
    if (house.isArchived()) throw new Error("House is archived, no further operation can be performed.", { cause: "HOUSE_ARCHIVED" })
}

export function assertHouseIsNotAbandoned(house: House): void {
    if (house.isAbandoned()) throw new Error("House is abandoned and has no active residents.", { cause: "HOUSE_ABANDONED" })
}

export function assertHouseIsOperable(house: House | null): asserts house is House {
    assertHouseExists(house)
    assertHouseIsNotArchived(house)
    assertHouseIsNotArchived(house)
}

export function assertResidentExists(resident: Resident | null): asserts resident is Resident {
    if (!resident) throw new Error("Resident not found.", { cause: "RESIDENT_NOT_FOUND" })
}

export function assertResidentBelongsToHouse(resident: Resident, house: House): void {
    if (resident.houseId !== house.id) throw new Error("Resident does not belong to this house.", { cause: "RESIDENT_HOUSE_MISMATCH" })
}

export function assertResidentIsActive(resident: Resident): void {
    if (!resident || !resident.isActive()) throw new Error("Resident is not active.", { cause: "RESIDENT_NOT_ACTIVE" })
}