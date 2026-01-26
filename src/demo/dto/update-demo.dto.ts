import { PartialType } from '@nestjs/mapped-types';
import { CreateDemoDto } from './create-demo.dto';

// UpdateDemoDto extends CreateDemoDto with all fields optional

// use PartialType() passing the class reference (CreateCatDto) as an argument
export class UpdateDemoDto extends PartialType(CreateDemoDto) {}

// use OmitType() to construct a type by picking all properties from CreateDemoDto and then removing description
// import { OmitType } from '@nestjs/mapped-types';
// export class UpdateDemoDto extends OmitType(CreateDemoDto, [
//   'description',
// ] as const) {}

// use PickType() to construct a type by picking the name property from CreateDemoDto
// import { PickType } from '@nestjs/mapped-types';
// export class UpdateDemoDto extends PickType(CreateDemoDto, ['name'] as const) {}

// use IntersectionType() to combine multiple DTOs into one
// import { IntersectionType } from '@nestjs/mapped-types';
// class DtoA {
//   propA: string;
// }
// class DtoB {
//   propB: number;
// }
// export class UpdateDemoDto extends IntersectionType(DtoA, DtoB) {}
