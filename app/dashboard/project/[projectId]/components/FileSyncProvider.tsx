"use client";
import { FileEventListener } from "./FileEventListener";

export const FileSyncProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <>
      {children}
      <FileEventListener />
    </>
  );
};
