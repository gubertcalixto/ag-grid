import { RowNode } from "./rowNode";
import { ICellEditorComp, ICellEditorParams } from "../interfaces/iCellEditor";
import { ICellRendererComp, ICellRendererFunc, ICellRendererParams } from "../rendering/cellRenderers/iCellRenderer";
import { Column } from "./column";
import { GridApi } from "../gridApi";
import { ColumnApi } from "../columns/columnApi";
import { IHeaderGroupComp } from "../headerRendering/headerGroup/headerGroupComp";
import { CellClickedEvent, CellContextMenuEvent, CellDoubleClickedEvent } from "../events";
import { ITooltipComp, ITooltipParams } from "../rendering/tooltipComponent";
import { ComponentSelectorResult } from "../components/framework/userComponentFactory";
import { IRowDragItem } from "../rendering/row/rowDragComp";
import { IFilterDef } from '../interfaces/iFilter';
import { ColumnGroup } from "./columnGroup";
import { RowClassParams } from "./gridOptions";

/***********************************************************************
 * Don't forget to update PropertyKeys if changing this class. PLEASE! *
 ***********************************************************************/

/** AbstractColDef can be a group or a column definition */
export interface AbstractColDef {
    /** The name to render in the column header */
    headerName?: string;
    /** Whether to show the column when the group is open / closed. */
    columnGroupShow?: string;
    /** CSS class for the header */
    headerClass?: string | string[] | ((params: any) => string | string[]);
    /** CSS class for the header */
    toolPanelClass?: string | string[] | ((params: any) => string | string[]);
    /** Expression or function to get the cells value. */
    headerValueGetter?: string | Function;
    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotKeys?: string[];

    /** Set to true to not include this column in the Columns Tool Panel */
    suppressColumnsToolPanel?: boolean;

    /** Set to true to not include this column / filter in the Filters Tool Panel */
    suppressFiltersToolPanel?: boolean;

    /** Tooltip for the column header */
    headerTooltip?: string;

    tooltipComponent?: { new(): ITooltipComp; } | string;
    tooltipComponentFramework?: any;
    tooltipComponentParams?: any;

    /** Allows the user to suppress certain keyboard events in the grid header */
    suppressHeaderKeyboardEvent?: (params: SuppressHeaderKeyboardEventParams) => boolean;
}

export interface ColGroupDef extends AbstractColDef {
    /** Columns in this group */
    children: (ColDef | ColGroupDef)[];
    /** Group ID */
    groupId?: string;
    /** Open by Default */
    openByDefault?: boolean;
    /** If true, group cannot be broken up by column moving, child columns will always appear side by side, however you can rearrange child columns within the group */
    marryChildren?: boolean;
    /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used**/
    headerGroupComponent?: string | { new(): IHeaderGroupComp; };
    /** The custom header group component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used**/
    headerGroupComponentFramework?: any;
    /** The custom header group component to be used for rendering the component header. If none specified the default AG Grid is used**/
    headerGroupComponentParams?: any;
}

export interface IAggFunc {
    (params: IAggFuncParams): any;
}

export interface IAggFuncParams {
    values: any[];
    column: Column;
    colDef: ColDef;
    rowNode: RowNode;
    data: any;
    api: GridApi;
    columnApi: ColumnApi;
    context: any;
}

/***********************************************************************
 * Don't forget to update PropertyKeys if changing this class. PLEASE! *
 ***********************************************************************/
export interface ColDef extends AbstractColDef, IFilterDef {

    /** The unique ID to give the column. This is optional. If missing, the ID will default to the field.
     *  If both field and colId are missing, a unique ID will be generated.
     *  This ID is used to identify the column in the API for sorting, filtering etc. */
    colId?: string;

    /** If sorting by default, set it here. Set to 'asc' or 'desc' */
    sort?: string | null;
    initialSort?: string;

    /** If sorting more than one column by default, specifies order in which the sorting should be applied. */
    sortIndex?: number | null;
    initialSortIndex?: number;

    /** @deprecated since v24 - use sortIndex instead*/
    sortedAt?: number;

    /** The sort order, provide an array with any of the following in any order ['asc','desc',null] */
    sortingOrder?: (string | null)[];

    /** The field of the row to get the cells data from */
    field?: string;

    /**
     * A comma separated string or array of strings containing ColumnType keys which can be used as a template for a column.
     * This helps to reduce duplication of properties when you have a lot of common column properties.
     */
    type?: string | string[];

    /** Set to true for this column to be hidden. Naturally you might think, it would make more sense to call this field 'visible' and mark it false to hide,
     *  however we want all default values to be false and we want columns to be visible by default. */
    hide?: boolean;
    initialHide?: boolean;

    /** Whether this column is pinned or not. */
    pinned?: boolean | string | null;
    initialPinned?: boolean | string;

    /** The field where we get the tooltip on the object */
    tooltipField?: string;

    /** The function used to calculate the tooltip of the object, tooltipField takes precedence */
    tooltipValueGetter?: (params: ITooltipParams) => string;

    /** Expression or function to get the cells value. */
    valueGetter?: ((params: ValueGetterParams) => any) | string;

    /** Expression or function to get the cells value for filtering. */
    filterValueGetter?: ((params: ValueGetterParams) => any) | string;

    /** If not using a field, then this puts the value into the cell */
    valueSetter?: ((params: ValueSetterParams) => boolean) | string;

    /** Function to return the key for a value - use this if the value is an object (not a primitive type) and you
     * want to a) group by this field or b) use set filter on this field. */
    keyCreator?: (value: any) => string;

    /** Actual width, in pixels, of the cell */
    width?: number;

    /** Default width, in pixels, of the cell */
    initialWidth?: number;

    /** Min width, in pixels, of the cell */
    minWidth?: number;

    /** Max width, in pixels, of the cell */
    maxWidth?: number;

    /** Sets the grow factor of a column. It specifies how much of the remaining
     * space should be assigned to the column.
     */
    flex?: number;
    initialFlex?: number;

    /** True if this column should stretch rows height to fit contents */
    autoHeight?: boolean;

    /** True if this column should wrap cell contents - typically used with autoHeight */
    wrapText?: boolean;

    /** Class to use for the cell. Can be string, array of strings, or function. */
    cellClass?: string | string[] | ((cellClassParams: CellClassParams) => string | string[]);

    /** An object of css values. Or a function returning an object of css values. */
    cellStyle?: {} | ((params: any) => {});

    /** A function for rendering a cell. */
    cellRenderer?: { new(): ICellRendererComp; } | ICellRendererFunc | string;
    cellRendererFramework?: any;
    cellRendererParams?: any;
    cellRendererSelector?: (params: ICellRendererParams) => ComponentSelectorResult;

    /** Cell editor */
    cellEditor?: { new(): ICellEditorComp; } | string;
    cellEditorFramework?: any;
    cellEditorParams?: any;
    cellEditorSelector?: (params: ICellEditorParams) => ComponentSelectorResult;

    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. */
    pinnedRowCellRenderer?: { new(): ICellRendererComp; } | ICellRendererFunc | string;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. */
    pinnedRowCellRendererFramework?: any;
    /** @deprecated Use cellRendererSelector if you want a different Cell Renderer for pinned rows. Check params.node.rowPinned. */
    pinnedRowCellRendererParams?: any;

    /** A function to format a value, should return a string. Not used for CSV export or copy to clipboard, only for UI cell rendering. */
    valueFormatter?: ((params: ValueFormatterParams) => string) | string;
    /** @deprecated Use valueFormatter for pinned rows, and check params.node.rowPinned. */
    pinnedRowValueFormatter?: ((params: ValueFormatterParams) => string) | string;

    /** Gets called after editing, converts the value in the cell. */
    valueParser?: ((params: ValueParserParams) => any) | string;

    /** Name of function to use for aggregation. One of [sum,min,max,first,last] or a function. */
    aggFunc?: string | IAggFunc | null;
    initialAggFunc?: string | IAggFunc;

    /** Agg funcs allowed on this column. If missing, all installed agg funcs are allowed.
     * Can be eg ['sum','avg']. This will restrict what the GUI allows to select only.*/
    allowedAggFuncs?: string[];

    /** To group by this column by default, either provide an index (eg rowGroupIndex=1), or set rowGroup=true. */
    rowGroupIndex?: number | null;
    rowGroup?: boolean;

    initialRowGroupIndex?: number;
    initialRowGroup?: boolean;

    /** Set to true to have the grid place the values for the group into the cell, or put the name of a grouped column to just show that group. */
    showRowGroup?: string | boolean;

    /** To pivot by this column by default, either provide an index (eg pivotIndex=1), or set pivot=true. */
    pivotIndex?: number | null;
    pivot?: boolean;

    initialPivotIndex?: number;
    initialPivot?: boolean;

    /** Comparator function for custom sorting. */
    comparator?: (valueA: any, valueB: any, nodeA: RowNode, nodeB: RowNode, isInverted: boolean) => number;

    /** Comparator for values, used by renderer to know if values have changed. Cells who's values have not changed don't get refreshed. */
    equals?: (valueA: any, valueB: any) => boolean;

    /** Comparator for ordering the pivot columns */
    pivotComparator?: (valueA: string, valueB: string) => number;

    /** Set to true to render a selection checkbox in the column. */
    checkboxSelection?: boolean | ((params: CheckboxSelectionCallbackParams) => boolean);

    /** If true, a 'select all' checkbox will be put into the header */
    headerCheckboxSelection?: boolean | ((params: any) => boolean);

    /** If true, the header checkbox selection will work on filtered items*/
    headerCheckboxSelectionFilteredOnly?: boolean;

    /** For grid row dragging, set to true to enable row dragging within the grid */
    rowDrag?: boolean | ((params: RowDragCallbackParams) => boolean);

    /** To configure the text to be displayed in the floating div while dragging a row when rowDrag is true */
    rowDragText?: ((params: IRowDragItem, dragItemCount: number) => string);

    /** For native drag and drop, set to true to enable drag source */
    dndSource?: boolean | ((params: DndSourceCallbackParams) => boolean);

    /** For native drag and drop, set to true to allow custom onRowDrag processing */
    dndSourceOnRowDrag?: ((params: { rowNode: RowNode, dragEvent: DragEvent; }) => void);

    /** Set to true if no menu should be shown for this column header. */
    suppressMenu?: boolean;

    /** The menu tabs to show, and in which order, the valid values for this property are:
     * filterMenuTab, generalMenuTab, columnsMenuTab **/
    menuTabs?: string[];

    /** Set to true if sorting allowed for this column. */
    sortable?: boolean;

    /** Set to true to not allow moving this column via dragging it's header */
    suppressMovable?: boolean;

    /** Set to true to not flash this column for value changes */
    suppressCellFlash?: boolean;

    /** Set to true to make sure this column is always first. Other columns, if movable, cannot move before this column. */
    lockPosition?: boolean;

    /** Set to true to block the user showing / hiding the column, the column can only be shown / hidden via definitions or API */
    lockVisible?: boolean;

    /** Set to true to block the user pinning the column, the column can only be pinned via definitions or API */
    lockPinned?: boolean;

    /** Set to true if you want the unsorted icon to be shown when no sort is applied to this column. */
    unSortIcon?: boolean;

    /** Set to true if you want this columns width to be fixed during 'size to fit' operation. */
    suppressSizeToFit?: boolean;

    /** Set to true if this column should be resizable */
    resizable?: boolean;

    /** Set to true if you do not want this column to be auto-resizable by double clicking it's edge. */
    suppressAutoSize?: boolean;

    /** Allows the user to suppress certain keyboard events in the grid cell */
    suppressKeyboardEvent?: (params: SuppressKeyboardEventParams) => boolean;

    /** If true, GUI will allow adding this columns as a row group */
    enableRowGroup?: boolean;

    /** If true, GUI will allow adding this columns as a pivot */
    enablePivot?: boolean;

    /** If true, GUI will allow adding this columns as a value */
    enableValue?: boolean;

    /** Set to true if this col is editable, otherwise false. Can also be a function to have different rows editable. */
    editable?: boolean | ((params: EditableCallbackParams) => boolean);

    colSpan?: (params: ColSpanParams) => number;

    rowSpan?: (params: RowSpanParams) => number;

    /** Set to true if this col should not be allowed take new values from the clipboard . */
    suppressPaste?: boolean | ((params: SuppressPasteCallbackParams) => boolean);

    /** Set to true if this col should not be navigable with the tab key. Can also be a function to have different rows editable. */
    suppressNavigable?: boolean | ((params: SuppressNavigableCallbackParams) => boolean);

    /** To create the quick filter text for this column, if toString is not good enough on the value. */
    getQuickFilterText?: (params: GetQuickFilterTextParams) => string;

    /** Callbacks for editing. See editing section for further details.
     * Return true if the update was successful, or false if not.
     * If false, then skips the UI refresh and no events are emitted.
     * Return false if the values are the same (ie no update). */
    newValueHandler?: (params: any) => boolean;

    /** If true, this cell will be in editing mode after first click. */
    singleClickEdit?: boolean;

    /** Cell template to use for cell. Useful for AngularJS cells. */
    template?: string;

    // This property can be reported as Critical Issues by some security scans.
    // We are aware of this, however As 'templateUrl' is a legacy property used by angular 1.x users
    // we don't want to santise it at this late stage due to the potential impact to existing users.
    // Note that if this property is not used by application developers it won't pose a security risk
    // in an application.
    /** Cell template URL to load template from to use for cell. Useful for AngularJS cells. */
    templateUrl?: string;

    /** Rules for applying css classes */
    cellClassRules?: { [cssClassName: string]: (Function | string); };

    /** Callbacks for editing.See editing section for further details. */
    onCellValueChanged?: Function;

    /** Function callback, gets called when a cell is clicked. */
    onCellClicked?: (event: CellClickedEvent) => void;

    /** Function callback, gets called when a cell is double clicked. */
    onCellDoubleClicked?: (event: CellDoubleClickedEvent) => void;

    /** Function callback, gets called when a cell is right clicked. */
    onCellContextMenu?: (event: CellContextMenuEvent) => void;

    /** Icons for this column. Leave blank to use default. */
    icons?: { [key: string]: string; };

    /** If true, grid will flash cell after cell is refreshed */
    enableCellChangeFlash?: boolean;

    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotValueColumn?: Column | null;

    /** Never set this, it is used internally by grid when doing in-grid pivoting */
    pivotTotalColumnIds?: string[];

    /** The custom header component to be used for rendering the component header. If none specified the default AG Grid is used**/
    headerComponent?: string | { new(): any; };
    /** The custom header component to be used for rendering the component header in the hosting framework (ie: React/Angular). If none specified the default AG Grid is used**/
    headerComponentFramework?: any;
    /** The custom header component parameters**/
    headerComponentParams?: any;

    /** Whether to display a floating filter for this column. */
    floatingFilter?: boolean;

    refData?: { [key: string]: string; };

    /** Defines the column data type used when charting */
    chartDataType?: 'category' | 'series' | 'time' | 'excluded';

    /** Params to customise the columns menu behaviour and appearance */
    columnsMenuParams?: ColumnsMenuParams;
}

export interface ColumnFunctionCallbackParams {
    node: RowNode;
    data: any;
    column: Column;
    colDef: ColDef;
    context: any;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
}

export interface CheckboxSelectionCallbackParams extends ColumnFunctionCallbackParams {}
export interface RowDragCallbackParams extends ColumnFunctionCallbackParams {}
export interface DndSourceCallbackParams extends ColumnFunctionCallbackParams {}
export interface EditableCallbackParams extends ColumnFunctionCallbackParams {}
export interface SuppressPasteCallbackParams extends ColumnFunctionCallbackParams {}
export interface SuppressNavigableCallbackParams extends ColumnFunctionCallbackParams {}

/**
 * @deprecated
 * No longer in use. Replaced with (params: ColumnFunctionCallbackParams) => boolean.
 */
export interface IsColumnFunc {
    (params: IsColumnFuncParams): boolean;
}

/**
 * @deprecated
 * Replaced with ColumnFunctionCallbackParams
 */
export interface IsColumnFuncParams extends ColumnFunctionCallbackParams {}

export interface GetQuickFilterTextParams {
    value: any;
    node: RowNode;
    data: any;
    column: Column;
    colDef: ColDef;
    context: any;
}

export interface ColumnsMenuParams {
    suppressSyncLayoutWithGrid?: boolean;
    suppressColumnFilter?: boolean;
    suppressColumnSelectAll?: boolean;
    suppressColumnExpandAll?: boolean;
    contractColumnSelection?: boolean;
}

export interface BaseColDefParams {
    node: RowNode | null;
    data: any;
    colDef: ColDef;
    column: Column;
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
    context: any;
}

export interface BaseWithValueColDefParams extends BaseColDefParams {
    value: any;
}

export interface ValueGetterParams extends BaseColDefParams {
    getValue: (field: string) => any;
}

export interface NewValueParams extends BaseColDefParams {
    oldValue: any;
    newValue: any;
}

export interface ValueSetterParams extends NewValueParams {
}

export interface ValueParserParams extends NewValueParams {
}

export interface ValueFormatterParams extends BaseWithValueColDefParams {
}

export interface ColSpanParams extends BaseColDefParams {
}

export interface RowSpanParams extends BaseColDefParams {
}

export interface SuppressKeyboardEventParams extends ColumnFunctionCallbackParams {
    // the keyboard event the grid received
    event: KeyboardEvent;
    // whether the cell is editing or not
    editing: boolean;
}

export interface SuppressHeaderKeyboardEventParams {
    api: GridApi | null | undefined;
    columnApi: ColumnApi | null | undefined;
    column: Column | ColumnGroup;
    colDef: ColDef | ColGroupDef | null;
    context: any;
    headerRowIndex: number;
    event: KeyboardEvent;
}

export interface CellClassParams extends RowClassParams {
    colDef: ColDef;
    value: any;
}
