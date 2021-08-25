import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LibraryComponent } from './library.component';
//import { DataTableDemoComponent } from './demo/data-table/data-table-demo.component';
//import { DemoCompDemoComponent } from './demo/demo-comp/demo-comp-demo.component';


const routes: Routes = [
    {
        path: 'lib',
        component: LibraryComponent,
        children: [
            {
                path: '',
                redirectTo: 'data-table',
                pathMatch: 'full',
            },
            // {
            //     path: 'data-table',
            //     component: DataTableDemoComponent
            // },
            // {
            //     path: 'demo-comp',
            //     //component: DemoCompDemoComponent
            // }
        ]
    },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class LibraryRoutingModule { }
