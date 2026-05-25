"use client";

import { motion, type Variants, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealDirection = "up" | "left" | "right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: RevealDirection;
  once?: boolean;
};

function offsetByDirection(direction: RevealDirection, distance: number) {
  if (direction === "left") return { x: -distance, y: 0 };
  if (direction === "right") return { x: distance, y: 0 };
  return { x: 0, y: distance };
}

function defaultDistanceByDirection(direction: RevealDirection) {
  if (direction === "left" || direction === "right") return 40;
  return 28;
}

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 1.0,
  distance,
  direction = "up",
  once = true,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const travelDistance = distance ?? defaultDistanceByDirection(direction);
  const offset = offsetByDirection(direction, travelDistance);

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, ...offset }}
      whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.25, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: reduceMotion ? 0 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: reduceMotion ? 0 : duration * 0.92 },
      }}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  staggerChildren?: number;
  once?: boolean;
};

export function Stagger({
  children,
  className,
  delayChildren = 0.07,
  staggerChildren = 0.1,
  once = true,
}: StaggerProps) {
  const reduceMotion = useReducedMotion();

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: reduceMotion
        ? { staggerChildren: 0 }
        : { delayChildren, staggerChildren },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2, margin: "0px 0px -10% 0px" }}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
};

export function StaggerItem({
  children,
  className,
  direction = "up",
  distance,
  duration = 0.95,
}: StaggerItemProps) {
  const reduceMotion = useReducedMotion();
  const travelDistance = distance ?? defaultDistanceByDirection(direction);
  const offset = offsetByDirection(direction, travelDistance);

  const itemVariants: Variants = {
    hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, ...offset },
    visible: reduceMotion
      ? { opacity: 1 }
      : {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration, ease: [0.22, 1, 0.36, 1] },
        },
  };

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
