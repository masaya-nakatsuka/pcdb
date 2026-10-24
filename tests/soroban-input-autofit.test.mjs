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
const fullSource=(await fs.readFile(new URL('../public/soroban/app.js', import.meta.url),'utf8')).replace(/^import[^\n]+\n/gm,'');
const source=fullSource.split("$$('[data-action]').forEach")[0];
const nativeEvents=fullSource.slice(fullSource.indexOf("gridWrap.addEventListener('focus'"),fullSource.indexOf("window.addEventListener('resize'"));

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
  const measured=[];
  const element=(tag='div')=>{const classes=new Set(),listeners=new Map();const node={tagName:tag.toUpperCase(),value:'',textContent:'',hidden:false,open:false,style:{},dataset:{},children:[],scrollLeft:0,scrollTop:0,
    attributes:{},listeners,classList:{add(...xs){xs.forEach(x=>classes.add(x));},remove(...xs){xs.forEach(x=>classes.delete(x));},toggle(){},contains:x=>classes.has(x)},
    setAttribute(key,value){this.attributes[key]=String(value);},getAttribute(key){return this.attributes[key]??null;},removeAttribute(key){delete this.attributes[key];},
    append(...items){this.children.push(...items);},replaceChildren(){this.children=[];this.textContent='';this.innerHTML='';},addEventListener(type,fn){listeners.set(type,[...(listeners.get(type)||[]),fn]);},
    focus(){document.activeElement=this;},select(){},contains(){return false;},remove(){},scrollIntoView(){},setSelectionRange(){},querySelector(){return element();},closest(){return this.parentElement||(this.parentElement=element());},
    matches(query){return query.split(',').some(x=>x.trim().toUpperCase()===this.tagName);},showModal(){this.open=true;},close(){this.open=false;},
    getBoundingClientRect(){if(tag==='table'){const entries=this.children.map(tr=>tr.children[0]);measured.push(entries.map(td=>({text:td.textContent,font:{...td.style},classes:[...td._classes]})));const width=Math.max(0,...entries.map(td=>{const size=parseFloat(td.style.fontSize)||12;return [...td.textContent].reduce((n,ch)=>n+(ch.charCodeAt(0)>255?size:size*.55),0)*(td.style.fontWeight==='600'||td._classes.has('table-heading')?1.1:1)+12+(td._classes.has('filter-heading')?29:12)+1;}));return {width};}return {left:0,top:0,right:100,bottom:30,width:100,height:30};},_classes:classes};return node;};
  const document={body:element(),title:'確認用 — そろばん',activeElement:null,listeners:new Map(),addEventListener(type,fn){this.listeners.set(type,[...(this.listeners.get(type)||[]),fn]);},querySelector(selector){if(!nodes.has(selector))nodes.set(selector,element(selector==='#cell-editor'||selector==='#formula-input'||selector==='#cell-address'?'input':'div'));return nodes.get(selector);},querySelectorAll(){return [];},createElement:element,createDocumentFragment:element};
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
      autoFitColumn,focusGrid,gridHasFocus,selectRow,sparseRows,rectangularSelectionReady,selectedRows:()=>selectedRows()?[...selectedRows()]:null,eachSelected,showTable,showFilter,
      getState:()=>clone(state),getSelection:()=>clone({selected,anchor,end}),
      selectCell(r,c){selected={r,c};anchor={...selected};end={...selected};},
      selectArea(r1,c1,r2,c2){selected={r:r1,c:c1};anchor={...selected};end={r:r2,c:c2};},
      raw:(key)=>cell(key).raw,
      loadWorkspace,persist,resumeBrowserSaving,showRestoreRecovery,sanitizeBook,pasteText,pasteFromClipboard,selectionText,rememberClipboard,setValue,
      sortSelection,switchBook,duplicateBook,duplicateSheet,importFile,startEdit,finishEdit,undo,copySelection,cancelClipboard,
      clearSelection,applyStyle,applySheetOp,fillSelection,showAutofill,changeStructure,autoSum,commitFormula,inputIsDirty,switchSheet,addSheet,openMenu,openModal,closeModal,renameBook,renameSheet,deleteBook,deleteSheet,navigateToAddress,selectionRange,agentHost,
      composition:()=>isComposing,editFormula(key,value){formulaTarget=key;$('#formula-input').value=value;},
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
  `+fullSource.slice(fullSource.indexOf('function autoFitColumn('),fullSource.indexOf("$('#grid-head').addEventListener('pointerdown'"))+nativeEvents,context,{filename:'app-integrity-source.js'});
  context.app.init(JSON.stringify(initial));
  return {app:context.app,storage,navigator,nodes,document,storageControl,measured};
}



function fire(target,type,properties={}){const event={target,key:'',keyCode:0,prevented:false,stopped:false,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...properties};for(const fn of target.listeners.get(type)||[])fn(event);return event;}
function key(h,key,extra={}){const editor=h.nodes.get('#cell-editor'),event=fire(editor,'keydown',{key,...extra});if(!event.stopped)for(const fn of h.document.listeners.get('keydown')||[])fn(event);return event;}
{
  const h=harness(),{app,nodes,document}=h;app.focusGrid();const input=nodes.get('#cell-editor');
  assert.equal(document.activeElement,input);assert.equal(input.hidden,false);assert(input.classList.contains('cell-input-ready'));assert.equal(app.pending().editing,null);
  const first=key(h,'h');assert.equal(first.prevented,false);assert.equal(input.value,'');assert.equal(app.pending().editing,null,'keydown must not inject first IME roman letter');
  fire(input,'compositionstart');assert.equal(document.activeElement,input);assert.equal(app.composition(),true);assert.equal(app.pending().editing.key,'A1');assert.equal(input.classList.contains('cell-input-ready'),false);
  input.value='ひ';fire(input,'beforeinput',{isComposing:true});fire(input,'input');const enter=key(h,'Enter',{isComposing:true,keyCode:229});assert.equal(enter.prevented,false);assert.equal(app.raw('A1'),'');assert.equal(app.pending().editing.key,'A1');
  input.value='ひとり';fire(input,'input');fire(input,'compositionend');key(h,'Enter');assert.equal(app.raw('A1'),'ひとり');assert.equal(app.getSelection().selected.r,1,'Enter advances exactly once');assert.equal(app.pending().editing,null);assert.equal(document.activeElement,input);assert.equal(app.history().undo,1);
  fire(input,'beforeinput',{inputType:'insertText',data:'x'});input.value='x';fire(input,'input');key(h,'Escape');assert.equal(app.raw('A2'),'');assert.equal(app.pending().editing,null);
}
{
  const h=harness(),{app,nodes,document}=h;app.setValue('A1','copy');app.focusGrid();let copied='';const event=fire(document,'copy',{clipboardData:{setData(mime,text){copied=text;}}});assert.equal(event.prevented,true);assert.equal(copied,'copy');
  key(h,'ArrowRight');assert.equal(app.getSelection().selected.c,1);key(h,'b',{ctrlKey:true});assert.equal(app.getState().books[0].sheets[0].cells.B1.bold,true);
  fire(document,'paste',{clipboardData:{getData(){return '貼り付け';}}});assert.equal(app.raw('B1'),'貼り付け');key(h,'z',{metaKey:true});assert.equal(app.raw('B1'),'');
  key(h,'F2');assert.equal(app.pending().editing.key,'B1');nodes.get('#cell-editor').value='edit';fire(document,'copy',{clipboardData:{setData(){throw Error('editing copy must remain native');}}});key(h,'Tab');assert.equal(app.raw('B1'),'edit');assert.equal(app.getSelection().selected.c,2);
}
{
  const data=fixture(),s=data.books[0].sheets[0];s.cells={A1:{raw:'1',format:'yen'},A2:{raw:'=1234567',format:'yen'},A40:{raw:'見えない行も幅に含める',font:'serif',fontSize:20,bold:true,italic:true}};s.filter={range:'A1:A40',criteria:[]};
  const {app,measured,storage}=harness(data);assert.equal(app.autoFitColumn(0),true);const width=app.getState().books[0].sheets[0].widths[0];assert(width>200&&width<=360);const entries=measured.at(-1);assert(entries.some(td=>td.text==='￥1,234,567'));const last=entries.find(td=>td.text==='見えない行も幅に含める');assert.equal(last.font.fontSize,'20px');assert.equal(last.font.fontWeight,'600');assert.equal(last.font.fontStyle,'italic');assert(last.classes.includes('cell-serif'));assert(entries[0].classes.includes('filter-heading'));
  assert.equal(app.history().undo,1);assert.equal(JSON.parse(storage.get('soroban-workspace-v1')).books[0].sheets[0].widths[0],width);app.autoFitColumn(0);assert.equal(app.history().undo,1,'unchanged fit creates no history');app.undo();assert.equal(app.getState().books[0].sheets[0].widths[0],108);app.undo(true);assert.equal(app.getState().books[0].sheets[0].widths[0],width);
}
{
 const data=fixture();data.books[0].sheets[0].cells.A1={raw:'長'.repeat(1000),fontSize:20};const {app}=harness(data);app.autoFitColumn(0);assert.equal(app.getState().books[0].sheets[0].widths[0],360);app.autoFitColumn(1);assert.equal(app.getState().books[0].sheets[0].widths[1],64);assert.equal(app.autoFitColumn(-1),false);assert.equal(app.autoFitColumn(12),false);
}
console.log('Native input and column autofit regression tests passed (IME, first key, composition Enter, edit/cancel, keyboard, clipboard, formatting, full rows, fonts, limits, persistence, undo/redo).');
