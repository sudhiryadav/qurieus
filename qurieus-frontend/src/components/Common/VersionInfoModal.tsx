"use client";

/**
 * Modal showing app version and last deployment date.
 * Displayed when user clicks the copyright in the footer.
 */
import ModalDialog from "@/components/ui/ModalDialog";

function formatDeploymentDate(raw: string | undefined): string {
  if (!raw || raw === "dev") return "Development";
  try {
    const iso = raw.replace(" ", "T").replace(" UTC", "Z");
    const date = new Date(iso);
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return raw;
  }
}

interface VersionInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VersionInfoModal({ isOpen, onClose }: VersionInfoModalProps) {
  const version = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0";
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
  const deploymentDate = formatDeploymentDate(buildTime);

  return (
    <ModalDialog isOpen={isOpen} onClose={onClose} header="Application Info">
      <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <span className="font-medium text-gray-900 dark:text-white">Version</span>
          <p className="mt-1">{version}</p>
        </div>
        <div>
          <span className="font-medium text-gray-900 dark:text-white">Last deployment</span>
          <p className="mt-1">{deploymentDate}</p>
        </div>
      </div>
    </ModalDialog>
  );
}
