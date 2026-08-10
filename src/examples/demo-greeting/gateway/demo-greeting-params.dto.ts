import { IsString, Length } from 'class-validator';

export class DemoGreetingParamsDto {
  @IsString()
  @Length(1, 64)
  readonly name: string;
}
