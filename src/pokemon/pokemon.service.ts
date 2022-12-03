import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  private defaultLimit: number;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    //aqui nos traemos el defaultLimit de las variables de entorno
    this.defaultLimit = configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto): Promise<Pokemon> {
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      console.log(error);
      this.handleExeptions(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginationDto;

    return this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v');
  }

  async findOne(term: string): Promise<Pokemon> {
    let pokemon: Pokemon;
    //if term is a number
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }
    //check if is a mongoId
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }
    //check if term is a name
    if (!pokemon) {
      pokemon = await this.pokemonModel
        .findOne({ name: term.toLocaleLowerCase().trim() })
        .lean('name');
    }

    if (!pokemon) {
      throw new NotFoundException(
        `Pokemon with id, name or number ${term} not found.`,
      );
    }
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    }
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      console.log(error);
      this.handleExeptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(term);
    // const result = await this.pokemonModel.findByIdAndDelete(id);
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedCount === 0) {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }
    return `Pokemon with id: ${id} has been delete succesfully`;
  }
  async fillDB(pokemons: CreatePokemonDto[]) {
    await this.pokemonModel.deleteMany();
    await this.pokemonModel.insertMany(pokemons);

    return `seed inserted successfully`;
  }

  private handleExeptions(error: any) {
    if (error.code === 11000) {
      throw new InternalServerErrorException(
        `Already a pokemon with that term ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `Internal error server - check logs`,
    );
  }
}
