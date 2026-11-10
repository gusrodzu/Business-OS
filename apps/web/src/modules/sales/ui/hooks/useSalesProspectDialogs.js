import {useCallback, useState} from 'react';
import {createBlankSalesProspect, toSalesProspectForm} from '../utils/salesProspectFormModel';

/** UI-only state for prospect drawer and editor; no API or domain mutations. */
export default function useSalesProspectDialogs() {
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [drawerTab, setDrawerTab] = useState('summary');
  const [prospectModal, setProspectModal] = useState(null);

  const openProspectDrawer = useCallback((prospect) => {
    setSelectedProspect(prospect);
    setDrawerTab('summary');
  }, []);

  const editProspect = useCallback((prospect) => {
    setProspectModal(toSalesProspectForm(prospect));
    setSelectedProspect(null);
  }, []);

  const closeProspectDrawer = useCallback(() => {
    setSelectedProspect(null);
  }, []);

  const closeProspectEditor = useCallback(() => {
    setProspectModal(null);
  }, []);

  const createProspect = useCallback(() => {
    setProspectModal(createBlankSalesProspect());
  }, []);

  return {
    selectedProspect, setSelectedProspect,
    drawerTab, setDrawerTab,
    prospectModal, setProspectModal,
    openProspectDrawer, closeProspectDrawer, editProspect, createProspect, closeProspectEditor,
  };
}
