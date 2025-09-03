import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AIPStructure,
  ColumnStylesPipe,
  IPEmailBuilderColumnDirective,
  IPEmailBuilderDynamicDirective,
  IPEmailBuilderSettingsDirective,
} from '@wlocalhost/ngx-email-builder';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDrag, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { NgStyle } from '@angular/common';

import { StructureSettingsComponent } from './structure-settings/structure-settings.component';
import { UIFormModule } from '../directives/form/form-input.directive';
import { TooltipDirective } from '../directives/tooltip/tooltip.directive';

@Component({
  selector: 'tail-structure',
  templateUrl: 'structure.component.html',
  styleUrls: ['structure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CdkDropList,
    NgStyle,
    IPEmailBuilderColumnDirective,
    CdkDrag,
    IPEmailBuilderDynamicDirective,
    CdkDragHandle,
    IPEmailBuilderSettingsDirective,
    StructureSettingsComponent,
    UIFormModule,
    TooltipDirective,
    ColumnStylesPipe,
  ],
  host: {
    '(click)': '$event.stopPropagation()', // Prevents the click event from bubbling up to the parent
  },
})
export class StructureComponent extends AIPStructure {
  hideDisclaimer(block: any): boolean {
    if (!block.innerText) return false;
    if (block.innerText.includes('{{Disclaimer}}')) {
      return true;
    } else return false;
  }
  hasDisclaimerInStructure(): boolean {
    const structure = this.currentStructure();

    // Check if structure contains only disclaimer blocks
    const allBlocks: any[] = [];
    structure.elements.forEach(column => {
      allBlocks.push(...column);
    });
    
    if (allBlocks.length === 0) return false;
    
    // If all blocks are disclaimer blocks, hide structure buttons
    return allBlocks.every((block: any) => this.hideDisclaimer(block));
  }
}
