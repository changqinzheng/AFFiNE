import { useDocMetaHelper } from '@affine/core/hooks/use-block-suite-page-meta';
import { useJournalHelper } from '@affine/core/hooks/use-journal';
import {
  PeekViewService,
  useInsidePeekView,
} from '@affine/core/modules/peek-view';
import { WorkbenchLink } from '@affine/core/modules/workbench';
import { useAFFiNEI18N } from '@affine/i18n/hooks';
import { LinkedPageIcon, TodayIcon } from '@blocksuite/icons';
import type { DocCollection } from '@blocksuite/store';
import { useService } from '@toeverything/infra';
import { type PropsWithChildren, useCallback, useRef } from 'react';

import * as styles from './styles.css';

export interface PageReferenceRendererOptions {
  pageId: string;
  docCollection: DocCollection;
  pageMetaHelper: ReturnType<typeof useDocMetaHelper>;
  journalHelper: ReturnType<typeof useJournalHelper>;
  t: ReturnType<typeof useAFFiNEI18N>;
}
// use a function to be rendered in the lit renderer
export function pageReferenceRenderer({
  pageId,
  pageMetaHelper,
  journalHelper,
  t,
}: PageReferenceRendererOptions) {
  const { isPageJournal, getLocalizedJournalDateString } = journalHelper;
  const referencedPage = pageMetaHelper.getDocMeta(pageId);
  let title =
    referencedPage?.title ?? t['com.affine.editor.reference-not-found']();
  let icon = <LinkedPageIcon className={styles.pageReferenceIcon} />;
  const isJournal = isPageJournal(pageId);
  const localizedJournalDate = getLocalizedJournalDateString(pageId);
  if (isJournal && localizedJournalDate) {
    title = localizedJournalDate;
    icon = <TodayIcon className={styles.pageReferenceIcon} />;
  }

  return (
    <>
      {icon}
      <span className="affine-reference-title">
        {title ? title : 'Untitled'}
      </span>
    </>
  );
}

export function AffinePageReference({
  pageId,
  docCollection,
  wrapper: Wrapper,
}: {
  docCollection: DocCollection;
  pageId: string;
  wrapper?: React.ComponentType<PropsWithChildren>;
}) {
  const pageMetaHelper = useDocMetaHelper(docCollection);
  const journalHelper = useJournalHelper(docCollection);
  const t = useAFFiNEI18N();
  const el = pageReferenceRenderer({
    pageId,
    pageMetaHelper,
    journalHelper,
    docCollection,
    t,
  });

  const ref = useRef<HTMLAnchorElement>(null);

  const peekView = useService(PeekViewService).peekView;
  const isInPeekView = useInsidePeekView();

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.shiftKey && ref.current) {
        e.preventDefault();
        e.stopPropagation();
        peekView.open(ref.current);
        return false; // means this click is handled
      }
      if (isInPeekView) {
        peekView.close();
      }
      return;
    },
    [isInPeekView, peekView]
  );

  return (
    <WorkbenchLink
      ref={ref}
      to={`/${pageId}`}
      onClick={onClick}
      className={styles.pageReferenceLink}
    >
      {Wrapper ? <Wrapper>{el}</Wrapper> : el}
    </WorkbenchLink>
  );
}
