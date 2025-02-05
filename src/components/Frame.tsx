"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import { PROJECT_TITLE, MAX_NUMBER, TARGET_NUMBER } from "~/lib/constants";

export default function Frame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [number, setNumber] = useState(1);
  const [isCounting, setIsCounting] = useState(true);
  const [hasWon, setHasWon] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCounting && number < MAX_NUMBER) {
      interval = setInterval(() => {
        setNumber(prev => prev + 1);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isCounting, number]);

  const handleTap = useCallback(() => {
    if (isCounting) {
      setIsCounting(false);
      setShowResult(true);
      
      if (number === TARGET_NUMBER) {
        setHasWon(true);
      }

      setTimeout(() => {
        setNumber(1);
        setIsCounting(true);
        setShowResult(false);
        setHasWon(false);
      }, 5000);
    }
  }, [isCounting, number]);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (context) {
        setContext(context);
        setAdded(context.client.added);
      }
      sdk.actions.ready({});
      setIsSDKLoaded(true);
    };
    
    if (!isSDKLoaded) {
      load();
    }
    
    return () => {
      sdk.removeAllListeners();
    };
  }, [isSDKLoaded]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      paddingTop: context?.client.safeAreaInsets?.top ?? 0,
      paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
      paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
      paddingRight: context?.client.safeAreaInsets?.right ?? 0,
    }}>
      <div 
        className="h-screen w-full flex flex-col items-center justify-center bg-black text-white"
        onClick={handleTap}
      >
        {showResult ? (
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 animate-pulse">
              {hasWon ? '🎉 YOU WIN! 🎉' : 'You lose :('}
            </h1>
            {hasWon && (
              <div className="text-4xl animate-bounce">
                🎊🎊🎊
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-9xl font-bold animate-pulse">
            {number}
          </h1>
        )}
        
        <div className="mt-4 text-sm text-gray-400">
          {isCounting ? 'Tap to freeze!' : 'Restarting in 5 seconds...'}
        </div>
      </div>
    </div>
  );
}
