import { Component } from "../../widgets/component";
import { RefSelector } from "../../widgets/componentAnnotations";
import { Autowired, PostConstruct } from "../../context/context";
import { IRowContainerComp, RowContainerCtrl, RowContainerName } from "./rowContainerCtrl";
import { ensureDomOrder, insertWithDomOrder } from "../../utils/dom";
import { RowComp } from "../../rendering/row/rowComp";
import { RowCtrl } from "../../rendering/row/rowCtrl";
import { Beans } from "../../rendering/beans";
import { getAllValuesInObject } from "../../utils/object";

function templateFactory(): string {
    const name = Component.elementGettingCreated.getAttribute('name') as RowContainerName;

    const cssClasses = RowContainerCtrl.getRowContainerCssClasses(name);

    let res: string;

    const template1 = name === RowContainerName.CENTER;
    const template2 = name === RowContainerName.TOP_CENTER || name === RowContainerName.BOTTOM_CENTER;

    if (template1) {
        res = /* html */
            `<div class="${cssClasses.wrapper}" ref="eWrapper" role="presentation" unselectable="on">
                <div class="${cssClasses.viewport}" ref="eViewport" role="presentation">
                    <div class="${cssClasses.container}" ref="eContainer" role="rowgroup" unselectable="on"></div>
                </div>
            </div>`;
    } else if (template2) {
        res = /* html */
            `<div class="${cssClasses.viewport}" ref="eViewport" role="presentation" unselectable="on">
                <div class="${cssClasses.container}" ref="eContainer" role="presentation" unselectable="on"></div>
            </div>`;
    } else {
        res = /* html */
            `<div class="${cssClasses.container}" ref="eContainer" role="presentation" unselectable="on"></div>`;
    }

    return res;
}

export class RowContainerComp extends Component {

    @Autowired('beans') private beans: Beans;

    @RefSelector('eViewport') private eViewport: HTMLElement;
    @RefSelector('eContainer') private eContainer: HTMLElement;
    @RefSelector('eWrapper') private eWrapper: HTMLElement;

    private readonly name: RowContainerName;

    private rowComps: {[id: string]: RowComp} = {};

    // we ensure the rows are in the dom in the order in which they appear on screen when the
    // user requests this via gridOptions.ensureDomOrder. this is typically used for screen readers.
    private domOrder: boolean;
    private lastPlacedElement: HTMLElement | null;

    constructor() {
        super(templateFactory());
        this.name = Component.elementGettingCreated.getAttribute('name') as RowContainerName;
    }

    @PostConstruct
    private postConstruct(): void {
        const compProxy: IRowContainerComp = {
            setViewportHeight: height => this.eViewport.style.height = height,
            setRowCtrls: rowCrtls => this.setRowCtrls(rowCrtls),
            setDomOrder: domOrder => {
                this.domOrder = domOrder;
            },
            setContainerWidth: width => this.eContainer.style.width = width
        };

        const ctrl = this.createManagedBean(new RowContainerCtrl(this.name));
        ctrl.setComp(compProxy, this.eContainer, this.eViewport, this.eWrapper);
    }

    private setRowCtrls(rowCtrls: RowCtrl[]): void {
        const oldRows = {...this.rowComps};
        this.rowComps = {};

        this.lastPlacedElement = null;

        const processRow = (rowCon: RowCtrl) => {
            const instanceId = rowCon.getInstanceId();
            const existingRowComp = oldRows[instanceId];
            if (existingRowComp) {
                this.rowComps[instanceId] = existingRowComp;
                delete oldRows[instanceId];
                this.ensureDomOrder(existingRowComp.getGui());
            } else {
                const rowComp = this.newRowComp(rowCon);
                this.rowComps[instanceId] = rowComp;
                this.appendRow(rowComp.getGui());
            }
        };

        rowCtrls.forEach(processRow);
        getAllValuesInObject(oldRows).forEach(rc => this.eContainer.removeChild(rc.getGui()));
    }

    public appendRow(element: HTMLElement) {
        if (this.domOrder) {
            insertWithDomOrder(this.eContainer, element, this.lastPlacedElement);
        } else {
            this.eContainer.appendChild(element);
        }
        this.lastPlacedElement = element;
    }

    private ensureDomOrder(eRow: HTMLElement): void {
        if (this.domOrder) {
            ensureDomOrder(this.eContainer, eRow, this.lastPlacedElement);
            this.lastPlacedElement = eRow;
        }
    }

    private newRowComp(rowCtrl: RowCtrl): RowComp {
        const pinned = RowContainerCtrl.getPinned(this.name);
        const res = new RowComp(rowCtrl, this, this.beans, pinned);
        return res;
    }

}