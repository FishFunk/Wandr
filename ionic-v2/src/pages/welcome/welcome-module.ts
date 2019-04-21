import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { WelcomePage } from './welcome';

@NgModule({
    declarations: [
        WelcomePage,
    ],
    imports: [
        IonicPageModule.forChild(WelcomePage),
    ],
    exports: [
        WelcomePage
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]

})

export class WelcomeModule { }
