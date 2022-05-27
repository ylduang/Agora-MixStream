import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnmount } from 'react-use';
import { RtcEngine } from '../../engine';
import { findVideoStreamFromProfile } from '../../services/api';
import { ChannelEnum } from '../../utils/channel';
import { useProfile } from '../profile';
import { useSession } from '../session';
import { EnginesContext } from './context';

export const EnginesProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [rtcEngine, setRtcEngine] = useState<RtcEngine>();
  const { profile } = useProfile();
  const session = useSession();
  const navigator = useNavigate();

  useEffect(() => {
    const stream = findVideoStreamFromProfile(profile);
    const channel = session?.channel;
    if (!stream || !session || !channel || rtcEngine) {
      return;
    }
    const { appId } = stream;
    const engine = RtcEngine.singleton(appId);
    engine.engineInit();
    setRtcEngine(engine);
  }, [profile, session, rtcEngine]);

  useEffect(() => {
    if (!rtcEngine) {
      return;
    }
    const handle = () => {
      navigator('/');
    };
    rtcEngine.on(ChannelEnum.QuitChannel, handle);
    return () => {
      rtcEngine.off(ChannelEnum.QuitChannel, handle);
    };
  }, [navigator, rtcEngine]);

  useUnmount(async () => {
    rtcEngine?.leaveChannel();
  });

  return (
    <EnginesContext.Provider
      value={{
        rtcEngine,
      }}
    >
      {children}
    </EnginesContext.Provider>
  );
};
