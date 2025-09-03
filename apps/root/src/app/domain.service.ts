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
   * Preserves the subdomain from the current hostname
   * @returns The full redirect URL with subdomain
   */
  getManageTemplateUrl(): string {
    const currentDomain = window.location.hostname;
    const baseDomain = this.detectBaseDomain(currentDomain);
    
    // Extract subdomain from current hostname
    const subdomain = this.extractSubdomain(currentDomain, baseDomain);
    
    // Construct the full redirect URL with subdomain
    const manageTemplateUrl = `https://${subdomain}.${baseDomain}/links/managetemplate1.php`;
    
    console.log(`DomainService: Current hostname: ${currentDomain}, Subdomain: ${subdomain}, Base domain: ${baseDomain}`);
    console.log(`DomainService: Manage template URL: ${manageTemplateUrl}`);
    
    return manageTemplateUrl;
  }

  /**
   * Gets a redirect URL for manage template page with optional subdomain
   * @param targetSubdomain Optional subdomain to redirect to (if not provided, uses current subdomain)
   * @returns The full redirect URL
   */
  getManageTemplateUrlWithSubdomain(targetSubdomain?: string): string {
    const currentDomain = window.location.hostname;
    const baseDomain = this.detectBaseDomain(currentDomain);
    
    // Use provided subdomain or extract from current hostname
    const subdomain = targetSubdomain || this.extractSubdomain(currentDomain, baseDomain);
    
    // Construct the full redirect URL
    const manageTemplateUrl = `https://${subdomain}.${baseDomain}/links/managetemplate1.php`;
    
    console.log(`DomainService: Target subdomain: ${targetSubdomain || 'current'}, Final subdomain: ${subdomain}, Base domain: ${baseDomain}`);
    console.log(`DomainService: Manage template URL: ${manageTemplateUrl}`);
    
    return manageTemplateUrl;
  }

  /**
   * Gets the full current hostname for redirects
   * Useful when you want to redirect to the same subdomain
   * @returns The full current hostname
   */
  getCurrentHostname(): string {
    return window.location.hostname;
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

  /**
   * Private method to extract subdomain from hostname
   * @param hostname The current hostname
   * @param baseDomain The detected base domain
   * @returns The subdomain (or empty string if no subdomain)
   */
  private extractSubdomain(hostname: string, baseDomain: string): string {
    console.log(`DomainService: Extracting subdomain from hostname: ${hostname}, baseDomain: ${baseDomain}`);
    
    if (hostname === baseDomain) {
      console.log(`DomainService: No subdomain found, hostname equals base domain`);
      return ''; // No subdomain
    }
    
    // Remove the base domain from the hostname to get subdomain
    const subdomain = hostname.replace(`.${baseDomain}`, '');
    
    console.log(`DomainService: Extracted subdomain: "${subdomain}"`);
    
    // If the result is empty or just dots, return empty string
    if (!subdomain || subdomain === '.') {
      console.log(`DomainService: Subdomain is empty or invalid, returning empty string`);
      return '';
    }
    
    // Clean up any trailing dots
    const cleanSubdomain = subdomain.replace(/\.+$/, '');
    console.log(`DomainService: Clean subdomain: "${cleanSubdomain}"`);
    
    return cleanSubdomain;
  }
} 