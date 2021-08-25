import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DemoComponent } from './component/demo.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'demo',
        pathMatch: 'full',
    },
    {
        path: 'demo',
        component: DemoComponent,
    },
    {
        path: 'demo/:country',
        component: DemoComponent,
    },

    {
        path: 'demo/:country/:province',
        component: DemoComponent,
    },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class DemoRoutingModule { }
