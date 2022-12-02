import { Injectable } from '@nestjs/common';
import { GetPokemons } from './interfaces/pokemon.interface';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { PokemonService } from 'src/pokemon/pokemon.service';

import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    private readonly pokemonService: PokemonService,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    const data = await this.http.get<GetPokemons>(
      'https://pokeapi.co/api/v2/pokemon?limit=10',
    );
    let pokemons: CreatePokemonDto[] = [];
    const result = data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      //!we transfor this segment to number by adding a "+" sign
      const no: number = +segments[segments.length - 2];
      // console.log({ name, no });
      const pokemon: CreatePokemonDto = { no, name };
      // this.pokemonService.create(pokemon);
      pokemons.push(pokemon);
      console.log(pokemons);
    });

    await this.pokemonService.fillDB(pokemons);
    return pokemons;
  }
}
