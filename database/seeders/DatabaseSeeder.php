<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            HorseSeeder::class,
            EpisodeFiveSeeder::class,
            HorseSerializationQueueSeeder::class, // must run last
        ]);
    }
}
