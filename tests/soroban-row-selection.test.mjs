import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import * as engine from '../public/soroban/engine.js';
import * as operations from '../public/soroban/sheet-ops.js';
import * as tableOperations from '../public/soroban/table-ops.js';
import { moveWorkbookRange } from '../public/soroban/clipboard-ops.js';
import * as vault from '../public/soroban/vault.js';
import { createBrowserPersistence } from '../public/soroban/browser-persistence.js';
import { createFileSaver } from '../public/soroban/file-save.js';
import { executeTask } from '../public/soroban/task-worker.js';

// Exercise the app's actual state transitions with a small DOM/storage adapter.
// Browser checks cover rendering, pointer events, focus and real file controls.
const source = (await fs.readFile(new URL('../public/soroban/app.js', import.meta.url), 'utf8'))
  .replace(/^import[^\n]+\n/gm, '').split("$$('[data-action]').forEach")[0];

function fixture() {
  return {version:1,activeBook:'book1',savedAt:123,books:[
    {id:'book1',name:'確認用',activeSheet:'sheet1',revision:0,updatedAt:123,sheets:[
      {id:'sheet1',name:'表',rows:40,cols:12,widths:[108,108,108],cells:{}}
    ]},
    {id:'book2',name:'別ブック',activeSheet:'sheet2',revision:0,updatedAt:123,sheets:[
      {id:'sheet2',name:'別表',rows:40,cols:12,widths:[108,108,108],cells:{}}
    ]}
  ]};
}

function harness(initial=fixture(), raw=JSON.stringify(initial), options={}) {
  const nodes=new Map(), storage=new Map([['soroban-workspace-v1',raw]]),storageControl={failWrites:false};
  const element=()=>({value:'',textContent:'',hidden:false,open:false,style:{},dataset:{},
    attributes:{},classList:{add(){},remove(){},toggle(){}},setAttribute(key,value){this.attributes[key]=String(value);},getAttribute(key){return this.attributes[key]??null;},removeAttribute(key){delete this.attributes[key];},append(){},replaceChildren(){this.textContent='';this.innerHTML='';},addEventListener(){},
    focus(){},select(){},contains(){return false;},scrollIntoView(){},setSelectionRange(){},querySelector(){return element();},closest(){return this.parentElement||(this.parentElement=element());},
    showModal(){this.open=true;},close(){this.open=false;},getBoundingClientRect(){return {left:0,top:0,right:100,bottom:30,width:100,height:30};}});
  const document={body:element(),title:'確認用 — そろばん',querySelector(selector){if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);},querySelectorAll(){return [];},createElement:element,createDocumentFragment:element};
  const navigator={clipboard:{readText:async()=>'',writeText:async()=>{}}};
  // Production modules share a realm. Bridge VM-created plain objects here so
  // their normal object validation is exercised without a test-only prototype mismatch.
  const bridge=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));
  const context=vm.createContext({...engine,...operations,...tableOperations,
    applySheetOperation:(book,operation)=>operations.applySheetOperation(bridge(book),bridge(operation)),
    normalizeTables:(sheet,input)=>tableOperations.normalizeTables(bridge(sheet),bridge(input)),
    reconcileTablesAfterWrite:(before,draft,addresses)=>{
      const next=bridge(draft),result=tableOperations.reconcileTablesAfterWrite(bridge(before),next,bridge(addresses));
      for(const key of Object.keys(draft))delete draft[key];Object.assign(draft,next);return result;
    },
    ...vault,createVaultSession:()=>vault.createVaultSession(options.cryptoEnv||{crypto:webcrypto,isSecureContext:true}),
    createBrowserPersistence:input=>createBrowserPersistence({...input,locks:options.locks??null}),createFileSaver,
    // This adapter exercises the real worker entry functions without making a
    // VM test pretend to validate browser Worker construction or cancellation.
    createTaskRunner:()=>({run:(type,payload)=>(options.runTask||executeTask)(type,type==='import-xlsx'?payload:bridge(payload)),cancel(){},dispose(){}}),SOROBAN_WORKER_SOURCE:'test-adapter',SOROBAN_CALC_WORKER_SOURCE:'test-calc-adapter',
    moveWorkbookRange,document,navigator,window:{innerWidth:1280,innerHeight:900},AbortController,TextEncoder,TextDecoder,MAX_BOOK_FILE_BYTES:32*1024*1024,URL,Blob,
    getComputedStyle:()=>({getPropertyValue:()=>''}),setTimeout:()=>0,clearTimeout(){},localStorage:{getItem:key=>storage.get(key)??null,setItem:(key,value)=>{if(storageControl.failWrites)throw Object.assign(Error('quota'),{name:'QuotaExceededError'});storage.set(key,value);}}});
  vm.runInContext(source+`
    renderAll=()=>{};renderSaveState=()=>{};renderSelection=()=>{};renderHeading=()=>{};renderUndo=()=>{};syncAgentDOM=()=>{};
    globalThis.app={
      init(value){$('#book-sidebar').hidden=true;state=JSON.parse(value);persistedSnapshot=localStorage.getItem(STORAGE);persistenceStore().adopt(persistedSnapshot);pendingRestoreWarning=false;storageConflict=false;saveOkay=true;cache=new Map();selected={r:0,c:0};anchor={...selected};end={...selected};renderedRows=Array.from({length:sheet().rows},(_,i)=>i);},
      selectRow,sparseRows,rectangularSelectionReady,selectedRows:()=>selectedRows()?[...selectedRows()]:null,eachSelected,showTable,showFilter,
      getState:()=>clone(state),getSelection:()=>clone({selected,anchor,end}),
      selectCell(r,c){selected={r,c};anchor={...selected};end={...selected};},
      selectArea(r1,c1,r2,c2){selected={r:r1,c:c1};anchor={...selected};end={r:r2,c:c2};},
      raw:(key)=>cell(key).raw,
      loadWorkspace,persist,resumeBrowserSaving,showRestoreRecovery,sanitizeBook,pasteText,pasteFromClipboard,selectionText,rememberClipboard,setValue,
      sortSelection,switchBook,duplicateBook,duplicateSheet,importFile,startEdit,finishEdit,undo,copySelection,cancelClipboard,
      clearSelection,applyStyle,applySheetOp,fillSelection,showAutofill,changeStructure,autoSum,commitFormula,inputIsDirty,switchSheet,addSheet,openMenu,openModal,closeModal,renameBook,renameSheet,deleteBook,deleteSheet,navigateToAddress,selectionRange,agentHost,
      editFormula(key,value){formulaTarget=key;$('#formula-input').value=value;},
      pending:()=>({editing:editing?{...editing}:null,formulaTarget,dirty:inputIsDirty()}),
      status:()=>({pendingRestoreWarning,saveOkay,storageConflict,vaultEnabled,vaultLocked,vaultBusy}),
      history:(id=state?.activeBook)=>({undo:undoStacks.get(id)?.length||0,redo:redoStacks.get(id)?.length||0}),
      configureSaving({asynchronous=true,session=null,encrypted=false}={}){asynchronousSaving=asynchronous;vaultEnabled=encrypted;if(session)vaultSession=session;},
      startBackgroundCalculation(){renderGrid();backgroundCalculationEnabled=true;calculation=null;scheduleCalculation();renderGrid();return calculation?.promise;},
      calculationState:()=>({status:calculation?.status,current:calculation?.key===calculationKey(),filtered:hasFilters(),hidden:hasHiddenRows(),rows:[...renderedRows]}),
      setFileSaver(value){fileSaver=value;},policyChanged(){aiPolicyGeneration++;},
      flushBrowserSaving,lockWorkspace,unlockWorkspace,changeVaultMode,persistAgentCandidate,
      pendingSaves:()=>browserPersistence?.pending()||0
    };
  `,context,{filename:'app-integrity-source.js'});
  context.app.init(JSON.stringify(initial));
  return {app:context.app,storage,navigator,nodes,document,storageControl};
}


const rowsOf=app=>JSON.parse(JSON.stringify(app.selectedRows()));
const sample=()=>{const value=fixture();for(let r=0;r<8;r++)value.books[0].sheets[0].cells['A'+(r+1)]={raw:String(r+1)};return value;};
{
 const {app}=harness(sample());
 app.selectRow(1);app.selectRow(4,{shiftKey:true});assert.deepEqual(rowsOf(app),[1,2,3,4]);
 app.selectRow(2,{shiftKey:true});assert.deepEqual(rowsOf(app),[1,2]);
 app.selectRow(5,{ctrlKey:true});assert.deepEqual(rowsOf(app),[1,2,5]);
 app.selectRow(2,{metaKey:true});assert.deepEqual(rowsOf(app),[1,5]);
 assert.equal(app.selectionRange(),'A2:L2,A6:L6');
 assert.equal(app.selectionText().split('\n').length,2);assert.equal(app.selectionText().split('\n')[1].split('\t')[0],'6');
 app.applyStyle('bold',true);assert.equal(app.getState().books[0].sheets[0].cells.A2.bold,true);assert.equal(app.getState().books[0].sheets[0].cells.A3.bold,undefined);
 app.clearSelection();assert.equal(app.raw('A2'),'');assert.equal(app.raw('A6'),'');assert.equal(app.raw('A3'),'3');
 app.undo();assert.equal(app.raw('A2'),'2');assert.equal(app.raw('A6'),'6');assert.equal(app.selectedRows(),null);
}
{
 const {app}=harness(sample());app.selectRow(1);app.selectRow(5,{metaKey:true});
 app.changeStructure('row','delete');assert.deepEqual(['A1','A2','A3','A4','A5','A6'].map(app.raw),['1','3','4','5','7','8']);
 assert.equal(app.history().undo,1);app.undo();assert.deepEqual(['A1','A2','A3','A6'].map(app.raw),['1','2','3','6']);
}
{
 const {app,nodes}=harness(sample());app.selectRow(1);app.selectRow(5,{ctrlKey:true});
 const before=JSON.stringify(app.getState());
 for(const run of [()=>app.fillSelection('down'),()=>app.showAutofill(),()=>app.autoSum(),()=>app.sortSelection(),()=>app.showFilter(),()=>app.showTable(),()=>app.changeStructure('row','insert'),()=>app.changeStructure('column','delete'),()=>app.pasteText('danger')]){
   assert.equal(run(),false);assert.equal(JSON.stringify(app.getState()),before);assert.match(nodes.get('#toast').textContent,/連続/);
 }
 assert.equal(app.rememberClipboard(app.selectionText(),{cut:true}),false);
}
{
 const {app}=harness(sample());app.selectRow(1);app.selectRow(5,{ctrlKey:true});
 app.selectCell(0,0);assert.equal(app.selectedRows(),null);assert.equal(app.selectionRange(),'A1');
 app.selectRow(1);app.selectRow(5,{ctrlKey:true});app.switchBook('book2');assert.equal(app.selectedRows(),null);
 app.switchBook('book1');app.selectRow(1);app.selectRow(5,{ctrlKey:true});app.navigateToAddress('B3:C4');assert.equal(app.selectedRows(),null);assert.equal(app.selectionRange(),'B3:C4');
}
{
 const {app,navigator}=harness(sample());app.selectRow(1);app.selectRow(5,{ctrlKey:true});
 let copied='';navigator.clipboard.writeText=async text=>{copied=text;};await app.copySelection();
 assert.equal(copied.split('\n').length,2);app.selectCell(10,0);app.pasteText(copied);assert.equal(app.raw('A11'),'2');assert.equal(app.raw('A12'),'6');assert.equal(app.raw('A13'),'');
}
{
 const {app,navigator,nodes}=harness(sample());app.selectRow(1);app.selectRow(5,{ctrlKey:true});
 let resolve;navigator.clipboard.readText=()=>new Promise(done=>resolve=done);const paste=app.pasteFromClipboard();
 app.selectRow(3,{ctrlKey:true});resolve('danger');await paste;assert.equal(app.raw('A4'),'4');assert.match(nodes.get('#toast').textContent,/中止/);
}

{
 const {app}=harness(sample());app.selectRow(1);app.selectRow(5,{ctrlKey:true});app.selectRow(1,{ctrlKey:true});assert.deepEqual(rowsOf(app),[5]);
 app.selectRow(5,{ctrlKey:true});assert.deepEqual(rowsOf(app),[5]);
 app.selectRow(1,{metaKey:true});app.selectRow(3,{ctrlKey:true,shiftKey:true});assert.deepEqual([...rowsOf(app)].sort((a,b)=>a-b),[1,2,3,5]);
}
{
 const {app}=harness(sample());app.selectRow(1);app.selectRow(5,{ctrlKey:true});app.changeStructure('row','delete');app.undo();app.undo(true);
 assert.deepEqual(['A1','A2','A3','A4','A5','A6'].map(app.raw),['1','3','4','5','7','8']);
}
{
 const {app,navigator,nodes}=harness(sample());app.selectRow(1);app.selectRow(5,{shiftKey:true});
 let resolve;navigator.clipboard.writeText=()=>new Promise(done=>resolve=done);const copy=app.copySelection(true);
 app.selectRow(1);app.selectRow(5,{ctrlKey:true});resolve();await copy;assert.match(nodes.get('#toast').textContent,/コピーだけ/);
 app.selectCell(10,0);app.pasteText('unrelated');assert.equal(app.raw('A2'),'2');assert.equal(app.raw('A6'),'6');
}
console.log('Row selection regression tests passed (range, toggle, clear, styles, copy, delete, undo, guards, navigation and async paste).');
