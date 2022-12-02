import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // console.log(value, metadata);
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`${value} is not a valid Mongo Id`);
    }
    // fetch('http://localhost:3000/api/v2/pokemons', { body: 'user' }).then(
    //   (res) => console.log(res.json()),
    // );
    return value;
  }
}
