import { Module } from '@nestjs/common';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { HubGroupsClient } from './hub-groups-client';

@Module({
    controllers: [ClassesController],
    providers: [ClassesService, HubGroupsClient],
})
export class ClassesModule { }
