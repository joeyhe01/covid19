import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatButtonModule} from '@angular/material/button';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@NgModule({
    imports: [
        CommonModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule, MatInputModule
        // MatSortModule, MatPaginatorModule
    ],
    exports: [
        CommonModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatTableModule,
        MatFormFieldModule, MatInputModule,
        // MatSortModule, MatPaginatorModule
    ]
})
export class CustomMaterialModule {}
