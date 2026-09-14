"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export type SwipeDirection = "left" | "right";
export type SwipeTrigger = { direction: SwipeDirection; token: number } | null;

interface SwipeDeckProps<T> {
  /** Cartes restantes, la première étant celle du dessus. */
  items: T[];
  keyOf: (item: T) => string;
  renderCard: (item: T) => React.ReactNode;
  /** Appelé une fois l'animation de sortie terminée — c'est là qu'on déclenche l'appel API. */
  onSwiped: (item: T, direction: SwipeDirection) => void;
  /** Déclenche un swipe programmatique de la carte du dessus (boutons ✕ / ♥). */
  trigger?: SwipeTrigger;
}

/** Pile de cartes façon swipe, avec glisser-déposer réel (souris/tactile). */
export function SwipeDeck<T>({ items, keyOf, renderCard, onSwiped, trigger }: SwipeDeckProps<T>) {
  const visible = items.slice(0, 3);

  return (
    <div className="relative aspect-[3/4] w-full">
      {visible.map((item, stackIndex) => (
        <StackCard
          key={keyOf(item)}
          stackIndex={stackIndex}
          trigger={stackIndex === 0 ? trigger : null}
          onSwiped={(direction) => onSwiped(item, direction)}
        >
          {renderCard(item)}
        </StackCard>
      ))}
    </div>
  );
}

function StackCard({
  stackIndex,
  trigger,
  onSwiped,
  children,
}: {
  stackIndex: number;
  trigger?: SwipeTrigger;
  onSwiped: (direction: SwipeDirection) => void;
  children: React.ReactNode;
}) {
  const isTop = stackIndex === 0;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -20], [1, 0]);

  const [exiting, setExiting] = useState<SwipeDirection | null>(null);
  const [lastToken, setLastToken] = useState<number | null>(null);

  useEffect(() => {
    if (isTop && trigger && trigger.token !== lastToken) {
      setLastToken(trigger.token);
      setExiting(trigger.direction);
    }
  }, [trigger, isTop, lastToken]);

  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={{ zIndex: 30 - stackIndex, x: isTop ? x : undefined, rotate: isTop ? rotate : 0 }}
      initial={false}
      animate={
        exiting
          ? { x: exiting === "right" ? 640 : -640, rotate: exiting === "right" ? 26 : -26, opacity: 0 }
          : { scale: 1 - stackIndex * 0.045, y: stackIndex * 16, opacity: stackIndex === 2 ? 0.55 : 1 }
      }
      transition={exiting ? { duration: 0.32, ease: "easeIn" } : { type: "spring", stiffness: 320, damping: 30 }}
      onAnimationComplete={() => {
        if (exiting) onSwiped(exiting);
      }}
      drag={isTop && !exiting ? "x" : false}
      dragElastic={0.7}
      dragConstraints={{ left: 0, right: 0 }}
      whileDrag={{ cursor: "grabbing" }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 110 || info.velocity.x > 600) setExiting("right");
        else if (info.offset.x < -110 || info.velocity.x < -600) setExiting("left");
      }}
    >
      {children}

      {isTop && !exiting && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-5 top-5 -rotate-12 rounded-xl border-[3px] border-vert-confirmation px-3 py-1 font-serif text-lg font-semibold text-vert-confirmation"
          >
            OUI
          </motion.div>
          <motion.div
            style={{ opacity: passOpacity }}
            className="pointer-events-none absolute right-5 top-5 rotate-12 rounded-xl border-[3px] border-bordeaux px-3 py-1 font-serif text-lg font-semibold text-bordeaux"
          >
            NON
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
