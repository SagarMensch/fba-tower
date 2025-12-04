

import React, { useState } from 'react';
import { Invoice, InvoiceStatus, RoleDefinition, WorkflowStepConfig, WorkflowHistoryItem } from '../types';
import { 
  ArrowLeft, CheckCircle, XCircle, X, Check, Printer, Download, 
  ShieldCheck, AlertTriangle, FileText, DollarSign, 
  AlertCircle, Clock, Link as LinkIcon, Box, PieChart, Lock,
  MessageSquare, User, Building2, Cpu, Edit2
} from 'lucide-react';

interface InvoiceDetailProps {
  invoice: Invoice;
  onBack: () => void;
  onUpdateInvoice: (invoice: Invoice) => void;
  activePersona: { id: string; role: string; name: string, roleId: string }; 
  roles: RoleDefinition[];
  workflowConfig: WorkflowStepConfig[];
  onWorkflowDecision: (invoiceId: string, stepId: string, decision: 'APPROVE' | 'REJECT', comment: string) => void;
}

export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, onBack, onUpdateInvoice, activePersona, roles, workflowConfig, onWorkflowDecision }) => {
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [reasonCode, setReasonCode] = useState('');
  const [comment, setComment] = useState('');

  const finalizeStatus = (newStatus: InvoiceStatus) => {
    onUpdateInvoice({ ...invoice, status: newStatus });
  };
  
  const handleDecision = (stepId: string, decision: 'APPROVE' | 'REJECT') => {
    onWorkflowDecision(invoice.id, stepId, decision, comment);
    setComment(''); // Clear comment after submission
  };

  const renderStandardDetail = () => {
    return (
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL: The Evidence (PDF) */}
        <div className="w-1/2 bg-[#525659] flex flex-col overflow-hidden relative border-r border-gray-300">
           <div className="h-10 bg-[#323639] flex items-center justify-between px-4 text-gray-300 border-b border-gray-600 flex-shrink-0">
             <div className="flex items-center space-x-2">
                <span className="text-xs font-medium">invoice_{invoice.invoiceNumber}.pdf</span>
                <span className="text-[10px] bg-gray-600 px-1.5 rounded">1/1</span>
             </div>
             <div className="flex space-x-3">
                <Download size={14} className="cursor-pointer hover:text-white" />
                <Printer size={14} className="cursor-pointer hover:text-white" />
             </div>
           </div>
           <div className="flex-1 overflow-y-auto p-8 flex justify-center custom-scrollbar">
             <div className="bg-white shadow-lg w-full max-w-[595px] min-h-[842px] p-10 text-xs font-mono text-gray-800 relative">
                 <div className="absolute top-10 right-10 border-4 border-red-600 text-red-600 font-bold text-xl px-4 py-2 opacity-30 transform -rotate-12 pointer-events-none">
                    RECEIVED
                 </div>
                 <div className="flex justify-between border-b-2 border-black pb-4 mb-8">
                    <div>
                       <h1 className="text-2xl font-bold tracking-tight mb-1">{invoice.carrier.toUpperCase()}</h1>
                       <p>Global Logistics Services</p>
                       <p>100 Shipping Way, Copenhagen</p>
                    </div>
                    <div className="text-right">
                       <h2 className="text-xl font-bold">INVOICE</h2>
                       <p>Inv #: {invoice.invoiceNumber}</p>
                       <p>Date: {invoice.date}</p>
                    </div>
                 </div>
                 <div className="mb-8">
                    <p className="font-bold text-gray-600 mb-1">BILL TO:</p>
                    <p className="font-bold text-sm">Hitachi Energy USA Inc.</p>
                    <p>901 Main Campus Drive</p>
                    <p>Raleigh, NC 27606</p>
                 </div>
                 <table className="w-full mb-8">
                   <thead>
                     <tr className="border-b border-black">
                       <th className="text-left py-2">Description</th>
                       <th className="text-right py-2">Amount</th>
                     </tr>
                   </thead>
                   <tbody>
                      {invoice.lineItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-200">
                          <td className="py-2">{item.description}</td>
                          <td className="py-2 text-right">${item.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
                 <div className="flex justify-end mb-12">
                   <div className="w-48">
                     <div className="flex justify-between py-1">
                       <span>Subtotal:</span>
                       <span>${invoice.amount.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between py-1 border-b border-black">
                       <span>Tax (0%):</span>
                       <span>$0.00</span>
                     </div>
                     <div className="flex justify-between py-2 font-bold text-sm">
                       <span>TOTAL:</span>
                       <span>${invoice.amount.toFixed(2)} USD</span>
                     </div>
                   </div>
                 </div>
                 <div className="text-center text-gray-400 text-[10px] mt-auto">
                    <p>Thank you for your business.</p>
                    <p>Terms: Net 45 Days</p>
                 </div>
             </div>
           </div>
        </div>

        {/* RIGHT PANEL: Digitized Data & Audit */}
        <div className="w-1/2 bg-white flex flex-col overflow-y-auto custom-scrollbar">
          <div className="px-8 py-6 border-b border-gray-100">
             <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center">
               <FileText size={16} className="mr-2 text-teal-600" />
               Extracted Data & Audit Results
             </h2>
             <p className="text-xs text-gray-500 mt-1 ml-6">AI Extraction Confidence: <span className="text-teal-600 font-bold">{invoice.extractionConfidence}%</span></p>
          </div>

          <div className="p-8 space-y-8">
             {invoice.dispute && (
                <div className="bg-amber-50 border border-amber-200 rounded-sm p-4">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3 flex items-center">
                     <MessageSquare size={14} className="mr-2"/> Dispute History
                  </h4>
                  <div className="space-y-3">
                     {invoice.dispute.history.map((item, idx) => {
                       const isVendor = item.actor === 'Vendor';
                       return (
                         <div key={idx} className="flex items-start space-x-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isVendor ? 'bg-blue-600 text-white' : 'bg-teal-600 text-white'}`}>
                               {isVendor ? <Building2 size={12} /> : <User size={12}/>}
                            </div>
                            <div>
                               <p className="text-xs">
                                  <span className="font-bold">{item.actor}</span>
                                  <span className="text-gray-500 ml-2">{item.action}</span>
                               </p>
                               {item.comment && (
                                  <p className="text-sm text-gray-800 mt-1 bg-white p-2 border border-gray-200 rounded-sm italic">
                                     "{item.comment}"
                                  </p>
                               )}
                               <p className="text-[10px] text-gray-400 mt-1">{item.timestamp}</p>
                            </div>
                         </div>
                       );
                     })}
                  </div>
                </div>
             )}

             <div className="grid grid-cols-2 gap-6">
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                   <p className="text-xs text-gray-400 uppercase font-bold">Vendor Name</p>
                   <p className="text-sm font-bold text-gray-900 mt-1">{invoice.carrier}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                   <p className="text-xs text-gray-400 uppercase font-bold">Invoice Number</p>
                   <p className="text-sm font-bold text-gray-900 mt-1">{invoice.invoiceNumber}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                   <p className="text-xs text-gray-400 uppercase font-bold">Total Amount</p>
                   <p className="text-sm font-bold text-gray-900 mt-1">${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm border border-gray-100">
                   <p className="text-xs text-gray-400 uppercase font-bold">Invoice Date</p>
                   <p className="text-sm font-bold text-gray-900 mt-1">{invoice.date}</p>
                </div>
             </div>
             
             <div className="bg-slate-50 border border-slate-200 rounded-sm p-4">
               <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Freight Rating Audit (Dual-Rating)</h3>
                  {invoice.tmsMatchStatus === 'NOT_FOUND' && (
                     <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded border border-red-200 font-bold uppercase">Ghost Shipment</span>
                  )}
               </div>
               <table className="w-full text-sm">
                 <thead>
                   <tr className="border-b border-slate-200">
                     <th className="text-left py-2 font-bold text-slate-600">Source</th>
                     <th className="text-right py-2 font-bold text-slate-600">Rate</th>
                     <th className="text-right py-2 font-bold text-slate-600">Variance</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                      <td className="py-2 text-slate-500 font-medium">1. TMS Planning (Est.)</td>
                      <td className="py-2 text-right font-mono text-slate-500 italic">
                        {invoice.tmsEstimatedAmount ? `$${invoice.tmsEstimatedAmount.toLocaleString('en-US', {minimumFractionDigits: 2})}` : '--'}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-400">-</td>
                   </tr>
                   <tr className="bg-white border-b border-gray-100">
                      <td className="py-2 pl-2 text-slate-800 font-bold border-l-4 border-teal-500">2. ATLAS Audit (Contract)</td>
                      <td className="py-2 text-right font-mono text-slate-800 font-bold">
                        ${(invoice.auditAmount || invoice.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                      <td className="py-2 text-right font-mono text-slate-400">0.00</td>
                   </tr>
                   <tr>
                      <td className="py-2 text-slate-700 font-medium">3. Carrier Billed</td>
                      <td className="py-2 text-right font-mono text-slate-600">
                        ${invoice.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}
                      </td>
                      <td className={`py-2 text-right font-mono font-bold ${invoice.variance > 0 ? 'text-red-600' : 'text-teal-600'}`}>
                        {invoice.variance > 0 ? '+' : ''}${invoice.variance.toFixed(2)}
                      </td>
                   </tr>
                 </tbody>
               </table>
             </div>

             {invoice.glSegments && (
                <div className="bg-white border border-gray-100 rounded-sm p-4 shadow-sm">
                   <div className="flex justify-between items-center mb-2">
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                        <PieChart size={14} className="mr-2"/> Smart GL Splitter
                     </h3>
                     <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 flex items-center">
                        <Cpu size={10} className="mr-1"/> AI Suggested
                     </span>
                   </div>
                   <div className="flex w-full h-4 rounded overflow-hidden my-4 shadow-inner bg-gray-100">
                     {invoice.glSegments.map(seg => (
                       <div 
                         key={seg.code}
                         style={{ width: `${seg.percentage}%` }}
                         className={`${seg.color}`}
                         title={`${seg.segment}: ${seg.percentage}%`}
                       ></div>
                     ))}
                   </div>
                   <ul className="space-y-2 text-xs">
                     {invoice.glSegments.map(seg => (
                       <li key={seg.code} className="flex justify-between items-center p-2 bg-gray-50 rounded-sm">
                         <div className="flex items-center">
                           <span className={`w-2.5 h-2.5 rounded-full mr-2 ${seg.color}`}></span>
                           <span className="font-bold text-gray-800">{seg.segment}</span>
                           <span className="text-gray-500 ml-2 font-mono">{seg.code}</span>
                         </div>
                         <div className="font-mono text-gray-900 font-bold">
                           ${seg.amount.toLocaleString('en-US', {minimumFractionDigits: 2})} 
                           <span className="text-gray-400 font-sans font-normal ml-1">({seg.percentage}%)</span>
                         </div>
                       </li>
                     ))}
                   </ul>
                   <div className="mt-4 pt-4 border-t border-gray-100 text-right">
                      <button className="flex items-center ml-auto px-3 py-1.5 rounded-sm text-xs font-bold uppercase border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                         <Edit2 size={12} className="mr-2"/> Override Split
                      </button>
                   </div>
                </div>
             )}

             <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
                   Approval Workflow
                </h4>
                <div className="space-y-4">
                  {(invoice.workflowHistory || []).map((historyStep, idx) => {
                    const stepConfig = workflowConfig.find(c => c.id === historyStep.stepId);
                    if (!stepConfig) return null;

                    const roleDef = roles.find(r => r.id === stepConfig.roleId);
                    const userCanAct = activePersona.roleId === stepConfig.roleId || roles.find(r => r.id === activePersona.roleId)?.permissions.canAdminSystem;
                    const isMyTurn = historyStep.status === 'ACTIVE' && userCanAct;
                    const isLocked = historyStep.status === 'ACTIVE' && !userCanAct;

                    return (
                      <div key={stepConfig.id} className="relative pl-8 pb-4 last:pb-0 animate-fadeIn">
                        {idx < (invoice.workflowHistory || []).length -1 && historyStep.status !== 'SKIPPED' && (
                          <div className={`absolute left-[11px] top-6 bottom-0 w-0.5 ${historyStep.status === 'APPROVED' ? 'bg-teal-200' : 'bg-gray-200'}`}></div>
                        )}
                        
                        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10
                          ${historyStep.status === 'APPROVED' ? 'bg-teal-100 border-teal-500 text-teal-600' : 
                            historyStep.status === 'ACTIVE' ? 'bg-blue-100 border-blue-500 text-blue-600 animate-pulse' :
                            historyStep.status === 'REJECTED' ? 'bg-red-100 border-red-500 text-red-600' :
                            historyStep.status === 'PROCESSING' ? 'bg-purple-100 border-purple-500 text-purple-600' :
                            historyStep.status === 'SKIPPED' ? 'bg-gray-100 border-gray-300 text-gray-400' :
                            'bg-gray-50 border-gray-300 text-gray-400'}
                        `}>
                          {historyStep.status === 'APPROVED' ? <Check size={12} /> : 
                           historyStep.status === 'REJECTED' ? <X size={12} /> :
                           historyStep.status === 'SKIPPED' ? <div className="w-2 h-0.5 bg-current"></div> :
                           <div className="w-2 h-2 rounded-full bg-current"></div>}
                        </div>

                        <div className={`bg-white border rounded-sm p-4 shadow-sm transition-all ${isMyTurn ? 'border-blue-300 ring-2 ring-blue-50' : 'border-gray-200'}`}>
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <p className="text-sm font-bold text-gray-900">{stepConfig.stepName}</p>
                                 <p className="text-xs text-gray-500">{historyStep.approverName ? `${historyStep.approverName} (${historyStep.approverRole})` : (roleDef?.name || 'System')}</p>
                              </div>
                              {historyStep.timestamp && <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">{historyStep.timestamp}</span>}
                              {isLocked && <Lock size={14} className="text-gray-400" title={`Awaiting action from ${roleDef?.name}`} />}
                           </div>

                           {historyStep.status === 'ACTIVE' && !stepConfig.isSystemStep ? (
                              <div className="mt-3">
                                 {isMyTurn ? (
                                   <>
                                     <textarea 
                                       className="w-full text-xs p-2 border border-gray-300 rounded-sm mb-2 focus:border-blue-500 focus:outline-none"
                                       placeholder="Add approval comment..."
                                       value={comment}
                                       onChange={(e) => setComment(e.target.value)}
                                     ></textarea>
                                     <div className="flex space-x-2">
                                        <button 
                                          onClick={() => handleDecision(stepConfig.id, 'APPROVE')}
                                          className="flex-1 bg-teal-600 text-white text-xs font-bold py-1.5 rounded-sm hover:bg-teal-700 transition-colors"
                                        >
                                          Approve
                                        </button>
                                        <button 
                                          onClick={() => handleDecision(stepConfig.id, 'REJECT')}
                                          className="flex-1 bg-white border border-red-200 text-red-600 text-xs font-bold py-1.5 rounded-sm hover:bg-red-50 transition-colors"
                                        >
                                          Reject
                                        </button>
                                     </div>
                                   </>
                                 ) : (
                                   <div className="bg-gray-50 border border-gray-200 p-2 rounded-sm text-xs text-gray-500 flex items-center">
                                      <Lock size={12} className="mr-2"/> 
                                      Waiting for <span className="font-bold mx-1">{roleDef?.name}</span> to take action.
                                   </div>
                                 )}
                              </div>
                           ) : (
                              (historyStep.comment || (historyStep.status === 'SKIPPED' && "Step skipped due to workflow conditions.")) && (
                                <div className="bg-gray-50 p-2 rounded-sm text-xs text-gray-600 italic border border-gray-100">
                                  "{historyStep.comment || "Step skipped due to workflow conditions."}"
                                </div>
                              )
                           )}
                           
                           {historyStep.status === 'PROCESSING' && (
                              <div className="mt-2 text-xs text-purple-600 flex items-center font-bold">
                                 <Clock size={12} className="mr-1 animate-spin" /> Processing Automation...
                              </div>
                           )}
                        </div>
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col font-sans bg-gray-100 overflow-hidden relative">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm z-20 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
             <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-gray-800 tracking-tight">Invoice #{invoice.invoiceNumber}</h2>
                {invoice.status === InvoiceStatus.APPROVED && <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded border border-teal-200">APPROVED</span>}
                {invoice.status === InvoiceStatus.EXCEPTION && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded border border-red-200">EXCEPTION</span>}
                {invoice.status === InvoiceStatus.REJECTED && <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-0.5 rounded border border-gray-300">REJECTED</span>}
                {invoice.status === InvoiceStatus.VENDOR_RESPONDED && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded border border-blue-200">VENDOR RESPONDED</span>}
             </div>
             <p className="text-xs text-gray-500 mt-0.5">{invoice.carrier} • {invoice.origin} to {invoice.destination}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
           <div className="text-right mr-4">
              <p className="text-xs text-gray-400 font-bold uppercase">Total Amount</p>
              <p className="text-lg font-bold text-gray-900">${invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
           </div>
           {invoice.status === InvoiceStatus.EXCEPTION && (
              <button 
                onClick={() => setShowUnlockModal(true)}
                className="flex items-center px-4 py-2 bg-[#004D40] text-white hover:bg-[#00352C] rounded-sm text-xs font-bold uppercase shadow-sm"
              >
                Force Approve
              </button>
           )}
        </div>
      </div>

      {renderStandardDetail()}

      {showUnlockModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-sm shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-red-50 flex items-center text-red-700">
               <AlertTriangle size={20} className="mr-2" />
               <h3 className="text-lg font-bold">Force Approval Confirmation</h3>
            </div>
            <div className="p-6">
               <p className="text-sm text-gray-600 mb-4">
                 You are about to override a system exception (<span className="font-bold">{invoice.reason}</span>). 
                 This action will be logged in the audit trail.
               </p>
               <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Reason Code</label>
               <select 
                 className="w-full border border-gray-300 rounded-sm p-2 text-sm mb-4"
                 value={reasonCode}
                 onChange={(e) => setReasonCode(e.target.value)}
               >
                 <option value="">Select Reason...</option>
                 <option value="commercial_decision">Commercial Decision (GM Approval)</option>
                 <option value="data_error">Master Data Error</option>
                 <option value="one_time_waiver">One-time Waiver</option>
               </select>
               <div className="flex justify-end space-x-3">
                  <button onClick={() => setShowUnlockModal(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-sm">Cancel</button>
                  <button 
                    onClick={() => {
                      if (reasonCode) {
                         finalizeStatus(InvoiceStatus.APPROVED);
                         setShowUnlockModal(false);
                      }
                    }}
                    disabled={!reasonCode}
                    className="px-4 py-2 text-sm font-bold bg-red-600 text-white hover:bg-red-700 rounded-sm disabled:opacity-50"
                  >
                    Confirm Override
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
