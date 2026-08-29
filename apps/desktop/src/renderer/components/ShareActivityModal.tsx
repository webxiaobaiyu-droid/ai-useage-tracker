import { Modal } from '@heroui/react';
import { useEffect, useState } from 'react';
import { fetchConfig } from '@/lib/api';
import { OPEN_SHARE_EVENT } from '@/lib/shell-events';
import {
  getShareCardVariant,
  ShareCardCarousel,
} from '../../../../../packages/dashboard/src/components/ShareCardCarousel';
import { ShareCardActions } from '../../../../../packages/dashboard/src/components/ShareCardActions';
import { useShareSnapshot } from '../../../../../packages/dashboard/src/hooks/ShareSnapshotContext';

/** Share-card preview backed by the current dashboard snapshot. */
export function ShareActivityModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [profile, setProfile] = useState({ avatarUrl: '', userName: '' });
  const { snapshot } = useShareSnapshot();

  useEffect(() => {
    const open = () => {
      setIsOpen(true);
      // Local identity: no account association in the desktop client.
      setProfile({ avatarUrl: '', userName: '' });
      void fetchConfig()
        .then((config) => {
          setProfile({
            avatarUrl: '',
            userName: config.deviceId?.slice(0, 8) || '匿名用户',
          });
        })
        .catch(() => setProfile({ avatarUrl: '', userName: '匿名用户' }));
    };
    window.addEventListener(OPEN_SHARE_EVENT, open);
    return () => window.removeEventListener(OPEN_SHARE_EVENT, open);
  }, []);

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
      <Modal.Container scroll="inside" size="lg">
        <Modal.Dialog aria-label="分享" className="overflow-hidden sm:max-w-190">
          <Modal.CloseTrigger aria-label="关闭分享" />
          <Modal.Body className="px-4 pb-4 pt-8 sm:px-8">
            <ShareCardCarousel
              activeIndex={activeIndex}
              avatarUrl={profile.avatarUrl}
              onActiveIndexChange={setActiveIndex}
              rangeLabel={snapshot?.rangeLabel}
              summary={snapshot?.summary ?? null}
              toolLabel={snapshot?.toolLabel}
              userName={profile.userName}
            />
          </Modal.Body>
          <Modal.Footer className="justify-center">
            <ShareCardActions
              avatarUrl={profile.avatarUrl}
              color={getShareCardVariant(activeIndex).color}
              petId={getShareCardVariant(activeIndex).petId}
              rangeLabel={snapshot?.rangeLabel}
              summary={snapshot?.summary ?? null}
              toolLabel={snapshot?.toolLabel}
              userName={profile.userName}
            />
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
