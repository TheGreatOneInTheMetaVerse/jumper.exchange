'use client';
import {
  TrackingAction,
  TrackingCategory,
  TrackingEventParameter,
} from '@/const/trackingKeys';
import { useAccounts } from '@/hooks/useAccounts';
import type {
  TrackDisconnectWalletProps,
  TrackEventProps,
  TrackTransactionProps,
  trackPageloadProps,
} from '@/types/userTracking';
import { EventTrackingTool } from '@/types/userTracking';
import { useCallback, useEffect } from 'react';

export function useUserTracking() {
  const { account } = useAccounts();

  useEffect(() => {
    if (account?.chainId) {
      typeof window !== 'undefined' &&
        window?.gtag('event', TrackingAction.SwitchChain, {
          category: TrackingCategory.Wallet,
          [TrackingEventParameter.SwitchedChain]: account?.chainId,
        });
    }
  }, [account, account?.chainId]);

  const trackDisconnectWallet = useCallback(
    ({ data, disableTrackingTool }: TrackDisconnectWalletProps) => {
      if (!disableTrackingTool?.includes(EventTrackingTool.GA)) {
        typeof window !== 'undefined' &&
          window?.gtag('event', TrackingAction.DisconnectWallet, {
            ...data,
          });
      }
    },
    [],
  );

  const trackEvent = useCallback(
    async ({
      action,
      category,
      label,
      value,
      data,
      disableTrackingTool,
      enableAddressable,
      isConversion,
    }: TrackEventProps) => {
      if (!disableTrackingTool?.includes(EventTrackingTool.GA)) {
        typeof window !== 'undefined' &&
          window?.gtag('event', action, {
            category: category,
            ...data,
          });
      }
      if (enableAddressable) {
        const dataArray = [];
        if (label) {
          dataArray.push({ name: 'label', value: label });
        }

        typeof window !== 'undefined' &&
          data &&
          window.__adrsbl.run(
            action,
            isConversion ?? false,
            dataArray.concat(
              Object.entries(data).map(([key, value]) => ({
                name: key,
                value,
              })),
            ),
          );
      }
    },
    [],
  );

  const trackPageload = useCallback(
    /**
     * Track PageLoad with GA, HJ and ARCx
     *
     */
    async ({
      destination,
      source,
      data,
      pageload, // requires page load? -> true
      disableTrackingTool,
      url,
    }: trackPageloadProps) => {
      if (!disableTrackingTool?.includes(EventTrackingTool.GA)) {
        typeof window !== 'undefined' &&
          window?.gtag('event', TrackingAction.PageLoad, {
            category: pageload ? 'external' : 'internal',
            url,
            source,
            destination,
            ...data,
          });
      }
    },
    [],
  );

  const trackTransaction = useCallback(
    /**
     * Track Transaction with GA, HJ and ARCx
     *
     */
    async ({
      action,
      category,
      value,
      data,
      disableTrackingTool,
      txhash,
    }: TrackTransactionProps) => {
      if (!disableTrackingTool?.includes(EventTrackingTool.GA)) {
        typeof window !== 'undefined' &&
          window?.gtag('event', action, {
            category,
            ...data,
          });
      }
    },
    [],
  );

  return {
    trackDisconnectWallet,
    trackEvent,
    trackPageload,
    trackTransaction,
  };
}
