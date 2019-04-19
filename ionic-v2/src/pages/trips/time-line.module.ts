import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TimeLine } from './time-line';

@NgModule({
    declarations: [
        TimeLine,
    ],
    imports: [
        IonicPageModule.forChild(TimeLine),
    ],
    exports: [
        TimeLine
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})

export class TimeLineModule { }
