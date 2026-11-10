import {useState} from 'react';
import {createBlankSalesProspect, toSalesProspectForm} from '../utils/salesProspectFormModel';

/** UI-only state for prospect drawer and editor; no API or domain mutations. */
export default function useSalesProspectDialogs() {
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [drawerTab, setDrawerTab] = useState('summary');
  const [prospectModal, setProspectModal] = useState(null);

  function openProspectDrawer(prospect) {
    setSelectedProspect(prospect);
    setDrawerTab('summary');
  }

  function editProspect(prospect) {
    setProspectModal(toSalesProspectForm(prospect));
    setSelectedProspect(null);
  }

  function closeProspectDrawer() {
    setSelectedProspect(null);
  }

  function closeProspectEditor() {
    setProspectModal(null);
  }

  function createProspect() {
    setProspectModal(createBlankSalesProspect());
  }

  return {
    selectedProspect, setSelectedProspect,
    drawerTab, setDrawerTab,
    prospectModal, setProspectModal,
    openProspectDrawer, closeProspectDrawer, editProspect, createProspect, closeProspectEditor,
  };
}
