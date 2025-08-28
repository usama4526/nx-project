import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DomainService {
  /**
   * Gets the base domain based on the current hostname
   * @returns The base domain (e.g., 'thelinksystems.com', 'testlinksystems.com', 'devlinksystems.com')
   */
  getBaseDomain(): string {
    const currentDomain = window.location.hostname;
    const baseDomain = this.detectBaseDomain(currentDomain);
    
    console.log(`DomainService: Current hostname: ${currentDomain}, Detected base domain: ${baseDomain}`);
    
    return baseDomain;
  }

  /**
   * Gets the API base URL based on the current hostname
   * @returns The API base URL (e.g., 'https://ltsd.thelinksystems.com')
   */
  getApiBaseUrl(): string {
    const currentDomain = window.location.hostname;
    const baseDomain = this.detectBaseDomain(currentDomain);
    const apiBaseUrl = `https://ltsd.${baseDomain}`;
    
    console.log(`DomainService: API base URL: ${apiBaseUrl}`);
    
    return apiBaseUrl;
  }

  /**
   * Gets the full redirect URL for manage template page
   * @returns The full redirect URL
   */
  getManageTemplateUrl(): string {
    const baseDomain = this.getBaseDomain();
    const manageTemplateUrl = `https://${baseDomain}/links/managetemplate1.php`;
    
    console.log(`DomainService: Manage template URL: ${manageTemplateUrl}`);
    
    return manageTemplateUrl;
  }

  /**
   * Private method to detect the base domain from a hostname
   * @param hostname The current hostname
   * @returns The detected base domain
   */
  private detectBaseDomain(hostname: string): string {
    if (hostname.includes('.thelinksystems.com')) {
      return 'thelinksystems.com';
    } else if (hostname.includes('.testlinksystems.com')) {
      return 'testlinksystems.com';
    } else if (hostname.includes('.devlinksystems.com')) {
      return 'devlinksystems.com';
    } else {
      return 'thelinksystems.com'; // Default fallback
    }
  }
} 