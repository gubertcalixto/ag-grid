import {
    AfterViewInit,
    Component,
    ComponentFactoryResolver,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    QueryList,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";

import {
    ColDef,
    ColumnApi,
    ComponentUtil,
    Grid,
    GridApi,
    GridOptions,
    GridParams,
    Module,
    AgPromise
} from "@ag-grid-community/core";

import {AngularFrameworkOverrides} from "./angularFrameworkOverrides";
import {AngularFrameworkComponentWrapper} from "./angularFrameworkComponentWrapper";
import {AgGridColumn} from "./ag-grid-column.component";

@Component({
    selector: 'ag-grid-angular',
    template: '',
    providers: [
        AngularFrameworkOverrides,
        AngularFrameworkComponentWrapper
    ],
    // tell angular we don't want view encapsulation, we don't want a shadow root
    encapsulation: ViewEncapsulation.None
})
export class AgGridAngular implements AfterViewInit {
    // not intended for user to interact with. so putting _ in so if user gets reference
    // to this object, they kind'a know it's not part of the agreed interface
    private _nativeElement: any;
    private _initialised = false;
    private _destroyed = false;

    private gridParams: GridParams;

    // in order to ensure firing of gridReady is deterministic
    private _fullyReady: AgPromise<boolean> = AgPromise.resolve(true);

    // making these public, so they are accessible to people using the ng2 component references
    public api: GridApi;
    public columnApi: ColumnApi;

    @ContentChildren(AgGridColumn) public columns: QueryList<AgGridColumn>;

    constructor(elementDef: ElementRef,
                private viewContainerRef: ViewContainerRef,
                private angularFrameworkOverrides: AngularFrameworkOverrides,
                private frameworkComponentWrapper: AngularFrameworkComponentWrapper,
                private componentFactoryResolver: ComponentFactoryResolver) {
        this._nativeElement = elementDef.nativeElement;

    }

    ngAfterViewInit(): void {
        this.frameworkComponentWrapper.setViewContainerRef(this.viewContainerRef);
        this.frameworkComponentWrapper.setComponentFactoryResolver(this.componentFactoryResolver);
        this.angularFrameworkOverrides.setEmitterUsedCallback(this.isEmitterUsed.bind(this));

        this.gridOptions = ComponentUtil.copyAttributesToGridOptions(this.gridOptions, this, true);

        this.gridParams = {
            globalEventListener: this.globalEventListener.bind(this),
            frameworkOverrides: this.angularFrameworkOverrides,
            providedBeanInstances: {
                frameworkComponentWrapper: this.frameworkComponentWrapper
            },
            modules: (this.modules || []) as any
        };

        if (this.columns && this.columns.length > 0) {
            this.gridOptions.columnDefs = this.columns
                .map((column: AgGridColumn): ColDef => {
                    return column.toColDef();
                });
        }

        new Grid(this._nativeElement, this.gridOptions, this.gridParams);

        if (this.gridOptions.api) {
            this.api = this.gridOptions.api;
        }

        if (this.gridOptions.columnApi) {
            this.columnApi = this.gridOptions.columnApi;
        }

        this._initialised = true;

        // sometimes, especially in large client apps gridReady can fire before ngAfterViewInit
        // this ties these together so that gridReady will always fire after agGridAngular's ngAfterViewInit
        // the actual containing component's ngAfterViewInit will fire just after agGridAngular's
        this._fullyReady.resolveNow(null, resolve => resolve);
    }

    public ngOnChanges(changes: any): void {
        if (this._initialised) {
            ComponentUtil.processOnChange(changes, this.gridOptions, this.api, this.columnApi);
        }
    }

    public ngOnDestroy(): void {
        if (this._initialised) {
            // need to do this before the destroy, so we know not to emit any events
            // while tearing down the grid.
            this._destroyed = true;
            if (this.api) {
                this.api.destroy();
            }
        }
    }

    // we'll emit the emit if a user is listening for a given event either on the component via normal angular binding
    // or via gridOptions
    protected isEmitterUsed(eventType: string): boolean {
        const emitter = <EventEmitter<any>>(<any>this)[eventType];
        const hasEmitter = !!emitter && emitter.observers && emitter.observers.length > 0;

        // gridReady => onGridReady
        const asEventName = `on${eventType.charAt(0).toUpperCase()}${eventType.substring(1)}`
        const hasGridOptionListener = !!this.gridOptions && !!this.gridOptions[asEventName];

        return hasEmitter || hasGridOptionListener;
    }

    private globalEventListener(eventType: string, event: any): void {
        // if we are tearing down, don't emit angular events, as this causes
        // problems with the angular router
        if (this._destroyed) {
            return;
        }

        // generically look up the eventType
        const emitter = <EventEmitter<any>>(<any>this)[eventType];
        if (emitter && this.isEmitterUsed(eventType)) {
            if (eventType === 'gridReady') {
                // if the user is listening for gridReady, wait for ngAfterViewInit to fire first, then emit the
                // gridReady event
                this._fullyReady.then((result => {
                    emitter.emit(event);
                }));
            } else {
                emitter.emit(event);
            }
        }
    }

    @Input() public gridOptions: GridOptions;
    @Input() public modules: Module[];

    // @START@
    @Input() public alignedGrids: any = undefined;
    @Input() public rowData: any = undefined;
    @Input() public columnDefs: any = undefined;
    @Input() public excelStyles: any = undefined;
    @Input() public pinnedTopRowData: any = undefined;
    @Input() public pinnedBottomRowData: any = undefined;
    @Input() public chartThemes: any = undefined;
    @Input() public components: any = undefined;
    @Input() public frameworkComponents: any = undefined;
    @Input() public rowStyle: any = undefined;
    @Input() public context: any = undefined;
    @Input() public autoGroupColumnDef: any = undefined;
    @Input() public localeText: any = undefined;
    @Input() public icons: any = undefined;
    @Input() public datasource: any = undefined;
    @Input() public serverSideDatasource: any = undefined;
    @Input() public viewportDatasource: any = undefined;
    @Input() public groupRowRendererParams: any = undefined;
    @Input() public aggFuncs: any = undefined;
    @Input() public fullWidthCellRendererParams: any = undefined;
    @Input() public defaultColGroupDef: any = undefined;
    @Input() public defaultColDef: any = undefined;
    @Input() public defaultExportParams: any = undefined;
    @Input() public defaultCsvExportParams: any = undefined;
    @Input() public defaultExcelExportParams: any = undefined;
    @Input() public columnTypes: any = undefined;
    @Input() public rowClassRules: any = undefined;
    @Input() public detailGridOptions: any = undefined;
    @Input() public detailCellRendererParams: any = undefined;
    @Input() public loadingCellRendererParams: any = undefined;
    @Input() public loadingOverlayComponentParams: any = undefined;
    @Input() public noRowsOverlayComponentParams: any = undefined;
    @Input() public popupParent: any = undefined;
    @Input() public colResizeDefault: any = undefined;
    @Input() public reduxStore: any = undefined;
    @Input() public statusBar: any = undefined;
    @Input() public sideBar: any = undefined;
    @Input() public chartThemeOverrides: any = undefined;
    @Input() public customChartThemes: any = undefined;
    @Input() public sortingOrder: any = undefined;
    @Input() public rowClass: any = undefined;
    @Input() public rowSelection: any = undefined;
    @Input() public overlayLoadingTemplate: any = undefined;
    @Input() public overlayNoRowsTemplate: any = undefined;
    @Input() public quickFilterText: any = undefined;
    @Input() public rowModelType: any = undefined;
    @Input() public editType: any = undefined;
    @Input() public domLayout: any = undefined;
    @Input() public clipboardDeliminator: any = undefined;
    @Input() public rowGroupPanelShow: any = undefined;
    @Input() public multiSortKey: any = undefined;
    @Input() public pivotColumnGroupTotals: any = undefined;
    @Input() public pivotRowTotals: any = undefined;
    @Input() public pivotPanelShow: any = undefined;
    @Input() public fillHandleDirection: any = undefined;
    @Input() public serverSideStoreType: any = undefined;
    @Input() public rowHeight: any = undefined;
    @Input() public detailRowHeight: any = undefined;
    @Input() public rowBuffer: any = undefined;
    @Input() public colWidth: any = undefined;
    @Input() public headerHeight: any = undefined;
    @Input() public groupHeaderHeight: any = undefined;
    @Input() public floatingFiltersHeight: any = undefined;
    @Input() public pivotHeaderHeight: any = undefined;
    @Input() public pivotGroupHeaderHeight: any = undefined;
    @Input() public groupDefaultExpanded: any = undefined;
    @Input() public minColWidth: any = undefined;
    @Input() public maxColWidth: any = undefined;
    @Input() public viewportRowModelPageSize: any = undefined;
    @Input() public viewportRowModelBufferSize: any = undefined;
    @Input() public autoSizePadding: any = undefined;
    @Input() public maxBlocksInCache: any = undefined;
    @Input() public maxConcurrentDatasourceRequests: any = undefined;
    @Input() public tooltipShowDelay: any = undefined;
    @Input() public cacheOverflowSize: any = undefined;
    @Input() public paginationPageSize: any = undefined;
    @Input() public cacheBlockSize: any = undefined;
    @Input() public infiniteInitialRowCount: any = undefined;
    @Input() public scrollbarWidth: any = undefined;
    @Input() public batchUpdateWaitMillis: any = undefined;
    @Input() public asyncTransactionWaitMillis: any = undefined;
    @Input() public blockLoadDebounceMillis: any = undefined;
    @Input() public keepDetailRowsCount: any = undefined;
    @Input() public undoRedoCellEditingLimit: any = undefined;
    @Input() public cellFlashDelay: any = undefined;
    @Input() public cellFadeDelay: any = undefined;
    @Input() public tabIndex: any = undefined;
    @Input() public localeTextFunc: any = undefined;
    @Input() public groupRowInnerRenderer: any = undefined;
    @Input() public groupRowInnerRendererFramework: any = undefined;
    @Input() public dateComponent: any = undefined;
    @Input() public dateComponentFramework: any = undefined;
    @Input() public groupRowRenderer: any = undefined;
    @Input() public groupRowRendererFramework: any = undefined;
    @Input() public isExternalFilterPresent: any = undefined;
    @Input() public getRowHeight: any = undefined;
    @Input() public doesExternalFilterPass: any = undefined;
    @Input() public getRowClass: any = undefined;
    @Input() public getRowStyle: any = undefined;
    @Input() public getRowClassRules: any = undefined;
    @Input() public traverseNode: any = undefined;
    @Input() public getContextMenuItems: any = undefined;
    @Input() public getMainMenuItems: any = undefined;
    @Input() public processRowPostCreate: any = undefined;
    @Input() public processCellForClipboard: any = undefined;
    @Input() public groupRowAggNodes: any = undefined;
    @Input() public getRowNodeId: any = undefined;
    @Input() public isFullWidthCell: any = undefined;
    @Input() public fullWidthCellRenderer: any = undefined;
    @Input() public fullWidthCellRendererFramework: any = undefined;
    @Input() public processSecondaryColDef: any = undefined;
    @Input() public processSecondaryColGroupDef: any = undefined;
    @Input() public getBusinessKeyForNode: any = undefined;
    @Input() public sendToClipboard: any = undefined;
    @Input() public navigateToNextHeader: any = undefined;
    @Input() public tabToNextHeader: any = undefined;
    @Input() public navigateToNextCell: any = undefined;
    @Input() public tabToNextCell: any = undefined;
    @Input() public getDetailRowData: any = undefined;
    @Input() public processCellFromClipboard: any = undefined;
    @Input() public getDocument: any = undefined;
    @Input() public postProcessPopup: any = undefined;
    @Input() public getChildCount: any = undefined;
    @Input() public getDataPath: any = undefined;
    @Input() public loadingCellRenderer: any = undefined;
    @Input() public loadingCellRendererFramework: any = undefined;
    @Input() public loadingOverlayComponent: any = undefined;
    @Input() public loadingOverlayComponentFramework: any = undefined;
    @Input() public noRowsOverlayComponent: any = undefined;
    @Input() public noRowsOverlayComponentFramework: any = undefined;
    @Input() public detailCellRenderer: any = undefined;
    @Input() public detailCellRendererFramework: any = undefined;
    @Input() public defaultGroupSortComparator: any = undefined;
    @Input() public isRowMaster: any = undefined;
    @Input() public isRowSelectable: any = undefined;
    @Input() public postSort: any = undefined;
    @Input() public processHeaderForClipboard: any = undefined;
    @Input() public paginationNumberFormatter: any = undefined;
    @Input() public processDataFromClipboard: any = undefined;
    @Input() public getServerSideGroupKey: any = undefined;
    @Input() public isServerSideGroup: any = undefined;
    @Input() public suppressKeyboardEvent: any = undefined;
    @Input() public createChartContainer: any = undefined;
    @Input() public processChartOptions: any = undefined;
    @Input() public getChartToolbarItems: any = undefined;
    @Input() public fillOperation: any = undefined;
    @Input() public isApplyServerSideTransaction: any = undefined;
    @Input() public getServerSideStoreParams: any = undefined;
    @Input() public isServerSideGroupOpenByDefault: any = undefined;
    @Input() public isGroupOpenByDefault: any = undefined;
    @Input() public suppressMakeColumnVisibleAfterUnGroup: any = undefined;
    @Input() public suppressRowClickSelection: any = undefined;
    @Input() public suppressCellSelection: any = undefined;
    @Input() public suppressHorizontalScroll: any = undefined;
    @Input() public alwaysShowHorizontalScroll: any = undefined;
    @Input() public alwaysShowVerticalScroll: any = undefined;
    @Input() public debug: any = undefined;
    @Input() public enableBrowserTooltips: any = undefined;
    @Input() public enableCellExpressions: any = undefined;
    @Input() public angularCompileRows: any = undefined;
    @Input() public angularCompileFilters: any = undefined;
    @Input() public groupSuppressAutoColumn: any = undefined;
    @Input() public groupSelectsChildren: any = undefined;
    @Input() public groupIncludeFooter: any = undefined;
    @Input() public groupIncludeTotalFooter: any = undefined;
    @Input() public groupUseEntireRow: any = undefined;
    @Input() public groupSuppressBlankHeader: any = undefined;
    @Input() public suppressMenuHide: any = undefined;
    @Input() public suppressRowDeselection: any = undefined;
    @Input() public unSortIcon: any = undefined;
    @Input() public suppressMultiSort: any = undefined;
    @Input() public singleClickEdit: any = undefined;
    @Input() public suppressLoadingOverlay: any = undefined;
    @Input() public suppressNoRowsOverlay: any = undefined;
    @Input() public suppressAutoSize: any = undefined;
    @Input() public skipHeaderOnAutoSize: any = undefined;
    @Input() public suppressParentsInRowNodes: any = undefined;
    @Input() public suppressColumnMoveAnimation: any = undefined;
    @Input() public suppressMovableColumns: any = undefined;
    @Input() public suppressFieldDotNotation: any = undefined;
    @Input() public enableRangeSelection: any = undefined;
    @Input() public enableRangeHandle: any = undefined;
    @Input() public enableFillHandle: any = undefined;
    @Input() public suppressClearOnFillReduction: any = undefined;
    @Input() public deltaSort: any = undefined;
    @Input() public suppressTouch: any = undefined;
    @Input() public suppressAsyncEvents: any = undefined;
    @Input() public allowContextMenuWithControlKey: any = undefined;
    @Input() public suppressContextMenu: any = undefined;
    @Input() public rememberGroupStateWhenNewData: any = undefined;
    @Input() public enableCellChangeFlash: any = undefined;
    @Input() public suppressDragLeaveHidesColumns: any = undefined;
    @Input() public suppressMiddleClickScrolls: any = undefined;
    @Input() public suppressPreventDefaultOnMouseWheel: any = undefined;
    @Input() public suppressCopyRowsToClipboard: any = undefined;
    @Input() public copyHeadersToClipboard: any = undefined;
    @Input() public pivotMode: any = undefined;
    @Input() public suppressAggFuncInHeader: any = undefined;
    @Input() public suppressColumnVirtualisation: any = undefined;
    @Input() public suppressAggAtRootLevel: any = undefined;
    @Input() public suppressFocusAfterRefresh: any = undefined;
    @Input() public functionsPassive: any = undefined;
    @Input() public functionsReadOnly: any = undefined;
    @Input() public animateRows: any = undefined;
    @Input() public groupSelectsFiltered: any = undefined;
    @Input() public groupRemoveSingleChildren: any = undefined;
    @Input() public groupRemoveLowestSingleChildren: any = undefined;
    @Input() public enableRtl: any = undefined;
    @Input() public suppressClickEdit: any = undefined;
    @Input() public rowDragManaged: any = undefined;
    @Input() public suppressRowDrag: any = undefined;
    @Input() public suppressMoveWhenRowDragging: any = undefined;
    @Input() public enableMultiRowDragging: any = undefined;
    @Input() public enableGroupEdit: any = undefined;
    @Input() public embedFullWidthRows: any = undefined;
    @Input() public deprecatedEmbedFullWidthRows: any = undefined;
    @Input() public suppressPaginationPanel: any = undefined;
    @Input() public floatingFilter: any = undefined;
    @Input() public groupHideOpenParents: any = undefined;
    @Input() public groupMultiAutoColumn: any = undefined;
    @Input() public pagination: any = undefined;
    @Input() public stopEditingWhenGridLosesFocus: any = undefined;
    @Input() public paginationAutoPageSize: any = undefined;
    @Input() public suppressScrollOnNewData: any = undefined;
    @Input() public purgeClosedRowNodes: any = undefined;
    @Input() public cacheQuickFilter: any = undefined;
    @Input() public deltaRowDataMode: any = undefined;
    @Input() public ensureDomOrder: any = undefined;
    @Input() public accentedSort: any = undefined;
    @Input() public suppressChangeDetection: any = undefined;
    @Input() public valueCache: any = undefined;
    @Input() public valueCacheNeverExpires: any = undefined;
    @Input() public aggregateOnlyChangedColumns: any = undefined;
    @Input() public suppressAnimationFrame: any = undefined;
    @Input() public suppressExcelExport: any = undefined;
    @Input() public suppressCsvExport: any = undefined;
    @Input() public treeData: any = undefined;
    @Input() public masterDetail: any = undefined;
    @Input() public suppressMultiRangeSelection: any = undefined;
    @Input() public enterMovesDownAfterEdit: any = undefined;
    @Input() public enterMovesDown: any = undefined;
    @Input() public suppressPropertyNamesCheck: any = undefined;
    @Input() public rowMultiSelectWithClick: any = undefined;
    @Input() public suppressEnterpriseResetOnNewColumns: any = undefined;
    @Input() public enableOldSetFilterModel: any = undefined;
    @Input() public suppressRowHoverHighlight: any = undefined;
    @Input() public suppressRowTransform: any = undefined;
    @Input() public suppressClipboardPaste: any = undefined;
    @Input() public suppressLastEmptyLineOnPaste: any = undefined;
    @Input() public serverSideSortingAlwaysResets: any = undefined;
    @Input() public reactNext: any = undefined;
    @Input() public suppressSetColumnStateEvents: any = undefined;
    @Input() public suppressColumnStateEvents: any = undefined;
    @Input() public enableCharts: any = undefined;
    @Input() public deltaColumnMode: any = undefined;
    @Input() public suppressMaintainUnsortedOrder: any = undefined;
    @Input() public enableCellTextSelection: any = undefined;
    @Input() public suppressBrowserResizeObserver: any = undefined;
    @Input() public suppressMaxRenderedRowRestriction: any = undefined;
    @Input() public excludeChildrenWhenTreeDataFiltering: any = undefined;
    @Input() public tooltipMouseTrack: any = undefined;
    @Input() public keepDetailRows: any = undefined;
    @Input() public paginateChildRows: any = undefined;
    @Input() public preventDefaultOnContextMenu: any = undefined;
    @Input() public undoRedoCellEditing: any = undefined;
    @Input() public allowDragFromColumnsToolPanel: any = undefined;
    @Input() public immutableData: any = undefined;
    @Input() public immutableColumns: any = undefined;
    @Input() public pivotSuppressAutoColumn: any = undefined;
    @Input() public suppressExpandablePivotGroups: any = undefined;
    @Input() public applyColumnDefOrder: any = undefined;
    @Input() public debounceVerticalScrollbar: any = undefined;
    @Input() public detailRowAutoHeight: any = undefined;
    @Input() public serverSideFilteringAlwaysResets: any = undefined;
    @Input() public suppressAggFilteredOnly: any = undefined;
    @Input() public showOpenedGroup: any = undefined;
    @Input() public suppressClipboardApi: any = undefined;
    @Input() public suppressModelUpdateAfterUpdateTransaction: any = undefined;
    @Input() public stopEditingWhenCellsLoseFocus: any = undefined;
    @Input() public maintainColumnOrder: any = undefined;

    @Output() public columnEverythingChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public newColumnsLoaded: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnPivotModeChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnRowGroupChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public expandOrCollapseAll: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnPivotChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public gridColumnsChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnValueChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnMoved: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnVisible: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnPinned: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnGroupOpened: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnResized: EventEmitter<any> = new EventEmitter<any>();
    @Output() public displayedColumnsChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public virtualColumnsChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public asyncTransactionsFlushed: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowGroupOpened: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowDataChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowDataUpdated: EventEmitter<any> = new EventEmitter<any>();
    @Output() public pinnedRowDataChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rangeSelectionChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public chartCreated: EventEmitter<any> = new EventEmitter<any>();
    @Output() public chartRangeSelectionChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public chartOptionsChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public chartDestroyed: EventEmitter<any> = new EventEmitter<any>();
    @Output() public toolPanelVisibleChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public modelUpdated: EventEmitter<any> = new EventEmitter<any>();
    @Output() public pasteStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() public pasteEnd: EventEmitter<any> = new EventEmitter<any>();
    @Output() public fillStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() public fillEnd: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellDoubleClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellMouseDown: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellContextMenu: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellValueChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowValueChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellFocused: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() public selectionChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellKeyDown: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellKeyPress: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellMouseOver: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellMouseOut: EventEmitter<any> = new EventEmitter<any>();
    @Output() public filterChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public filterModified: EventEmitter<any> = new EventEmitter<any>();
    @Output() public filterOpened: EventEmitter<any> = new EventEmitter<any>();
    @Output() public sortChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public virtualRowRemoved: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowDoubleClicked: EventEmitter<any> = new EventEmitter<any>();
    @Output() public gridReady: EventEmitter<any> = new EventEmitter<any>();
    @Output() public gridSizeChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public viewportChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public scrollbarWidthChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public firstDataRendered: EventEmitter<any> = new EventEmitter<any>();
    @Output() public dragStarted: EventEmitter<any> = new EventEmitter<any>();
    @Output() public dragStopped: EventEmitter<any> = new EventEmitter<any>();
    @Output() public checkboxChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowEditingStarted: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowEditingStopped: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellEditingStarted: EventEmitter<any> = new EventEmitter<any>();
    @Output() public cellEditingStopped: EventEmitter<any> = new EventEmitter<any>();
    @Output() public bodyScroll: EventEmitter<any> = new EventEmitter<any>();
    @Output() public animationQueueEmpty: EventEmitter<any> = new EventEmitter<any>();
    @Output() public heightScaleChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public paginationChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public componentStateChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public bodyHeightChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public displayedColumnsWidthChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public scrollVisibilityChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnHoverChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public flashCells: EventEmitter<any> = new EventEmitter<any>();
    @Output() public paginationPixelOffsetChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public displayedRowsChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public leftPinnedWidthChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rightPinnedWidthChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowContainerHeightChanged: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowDragEnter: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowDragMove: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowDragLeave: EventEmitter<any> = new EventEmitter<any>();
    @Output() public rowDragEnd: EventEmitter<any> = new EventEmitter<any>();
    @Output() public popupToFront: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnRowGroupChangeRequest: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnPivotChangeRequest: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnValueChangeRequest: EventEmitter<any> = new EventEmitter<any>();
    @Output() public columnAggFuncChangeRequest: EventEmitter<any> = new EventEmitter<any>();
    @Output() public keyboardFocus: EventEmitter<any> = new EventEmitter<any>();
    @Output() public mouseFocus: EventEmitter<any> = new EventEmitter<any>();
    @Output() public storeUpdated: EventEmitter<any> = new EventEmitter<any>();
    // @END@
}

