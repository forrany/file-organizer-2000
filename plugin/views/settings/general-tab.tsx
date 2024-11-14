import React, { useState, useEffect } from "react";
import { Notice } from "obsidian";
import FileOrganizer from "../../index";
import { logger } from "../../services/logger";

interface GeneralTabProps {
  plugin: FileOrganizer;
}

interface UsageData {
  tokenUsage: number;
  maxTokenUsage: number;
  subscriptionStatus: string;
  currentPlan: string;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({ plugin }) => {
  const [licenseKey, setLicenseKey] = useState(plugin.settings.API_KEY);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const response = await fetch(`${plugin.getServerUrl()}/api/usage`, {
        headers: {
          Authorization: `Bearer ${plugin.settings.API_KEY}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch usage data');
      
      const data = await response.json();
      setUsageData(data);
    } catch (error) {
      logger.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLicenseKeyChange = async (value: string) => {
    setLicenseKey(value);
    plugin.settings.API_KEY = value;
    await plugin.saveSettings();
  };

  const handleActivate = async () => {
    const isValid = await plugin.isLicenseKeyValid(licenseKey);
    if (isValid) {
      new Notice("License key activated successfully!", 5000);
    } else {
      new Notice("Invalid license key. Please try again.");
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="file-organizer-settings">
      <div className="setting">
        <div className="setting-item">
          <div className="setting-item-info">
            <div className="setting-item-name">File Organizer License Key</div>
            <div className="setting-item-description">
              Get a license key to activate File Organizer 2000.
            </div>
          </div>
          <div className="setting-item-control">
            <input
              type="text"
              placeholder="Enter your File Organizer License Key"
              value={licenseKey}
              onChange={e => handleLicenseKeyChange(e.target.value)}
            />
            <button onClick={handleActivate}>Activate</button>
          </div>
        </div>
      </div>

      {plugin.settings.isLicenseValid && (
        <p className="license-status activated">License Status: Activated</p>
      )}

      <div className="flex items-center gap-2 mb-4">
        <button
          className="file-organizer-login-button"
          onClick={() =>
            window.open(
              "https://fileorganizer2000.com/?utm_source=obsidian&utm_medium=in-app&utm_campaign=get-license",
              "_blank"
            )
          }
        >
          Get License
        </button>
      </div>

      <div className="youtube-embed">
        <iframe
          width="100%"
          height="315"
          src="https://www.youtube.com/embed/dRtLCBFzTAo?si=eo0h8dxTW-AIsNpp"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        <p className="file-organizer-support-text">
          File Organizer 2000 is an open-source initiative developed by two
          brothers. If you find it valuable, please{" "}
          <a
            href="https://fileorganizer2000.com/?utm_source=obsidian&utm_medium=in-app&utm_campaign=support-us"
            target="_blank"
            rel="noopener noreferrer"
          >
            consider supporting us
          </a>{" "}
          to help improve and maintain the project. 🙏
        </p>
        <p className="text-[--text-muted]">
          <a
            href="https://discord.gg/UWH53WqFuE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[--text-accent] hover:text-[--text-accent-hover]"
          >
            Need help? Ask me on Discord.
          </a>
        </p>
      </div>

      {usageData && (
        <div className="setting-item">
          <div className="setting-item-info">
            <div className="setting-item-name">Token Usage</div>
            <div className="setting-item-description">
              Your current token usage and limits
            </div>
          </div>
          <div className="setting-item-control">
            <div className="token-usage-stats">
              <div className="usage-bar">
                <div 
                  className="usage-progress"
                  style={{
                    width: `${(usageData.tokenUsage / usageData.maxTokenUsage) * 100}%`,
                    backgroundColor: 'var(--interactive-accent)',
                    height: '8px',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div className="usage-numbers">
                {formatNumber(usageData.tokenUsage)} / {formatNumber(usageData.maxTokenUsage)} tokens
              </div>
              <div className="usage-plan">
                Current Plan: {usageData.currentPlan || 'Free'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
