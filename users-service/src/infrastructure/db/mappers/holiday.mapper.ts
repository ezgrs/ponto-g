import { Holiday } from "@/domain/entities/holiday.js"
import { HolidayEntity } from "../entities/holiday.entity.js"

export namespace HolidayMapper {
    export function toDomain(entity: HolidayEntity): Holiday {
        return {
            id: entity.id,
            name: entity.name,
            date: entity.date,
            type: entity.type,
            shift: entity.shift,
        }
    }

    export function toEntity(domain: Holiday): HolidayEntity {
        const entity = new HolidayEntity()
        entity.id = domain.id
        entity.name = domain.name
        entity.date = domain.date
        entity.type = domain.type
        entity.shift = domain.shift
        return entity
    }
}
