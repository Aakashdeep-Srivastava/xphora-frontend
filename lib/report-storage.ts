// lib/report-storage.ts
export interface UserReport {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  media: {
    url: string;
    type: 'image' | 'video';
    fileName: string;
    size: number;
  };
  analysis: {
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    tags: string[];
    confidence: number;
    suggestedActions: string[];
    landmarks: string[];
    aiTitle: string;
  };
  userComments?: string;
  timestamp: Date;
  status: 'pending' | 'analyzed' | 'verified' | 'resolved';
  views: number;
  helpfulVotes: number;
  verifiedBy?: string;
  resolvedAt?: Date;
}

export interface ReportFilter {
  categories?: string[];
  severities?: string[];
  timeRange?: 'hour' | 'day' | 'week' | 'month';
  status?: string[];
  userId?: string;
}

class ReportStorageService {
  private readonly STORAGE_KEY = 'xphora_reports';
  private readonly USER_KEY = 'xphora_user';

  // User management
  getCurrentUser(): { id: string; name: string; email?: string; avatar?: string } | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      // Create anonymous user if none exists
      const anonymousUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `Citizen ${Math.floor(Math.random() * 1000)}`,
        email: undefined,
        avatar: undefined
      };
      this.setCurrentUser(anonymousUser);
      return anonymousUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  setCurrentUser(user: { id: string; name: string; email?: string; avatar?: string }): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  // Report storage operations
  saveReport(reportData: Omit<UserReport, 'id' | 'timestamp' | 'views' | 'helpfulVotes' | 'status'>): string {
    try {
      const reports = this.getAllReports();
      const newReport: UserReport = {
        ...reportData,
        id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        views: 0,
        helpfulVotes: 0,
        status: 'analyzed'
      };

      reports.unshift(newReport); // Add to beginning of array (newest first)
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
      
      console.log('Report saved successfully:', newReport.id);
      return newReport.id;
    } catch (error) {
      console.error('Error saving report:', error);
      throw new Error('Failed to save report');
    }
  }

  getAllReports(): UserReport[] {
    try {
      const reportsData = localStorage.getItem(this.STORAGE_KEY);
      if (!reportsData) return [];
      
      const reports = JSON.parse(reportsData);
      // Convert timestamp strings back to Date objects
      return reports.map((report: any) => ({
        ...report,
        timestamp: new Date(report.timestamp),
        resolvedAt: report.resolvedAt ? new Date(report.resolvedAt) : undefined
      }));
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  }

  getReportById(id: string): UserReport | null {
    try {
      const reports = this.getAllReports();
      return reports.find(report => report.id === id) || null;
    } catch (error) {
      console.error('Error getting report by ID:', error);
      return null;
    }
  }

  getFilteredReports(filter: ReportFilter): UserReport[] {
    try {
      let reports = this.getAllReports();

      // Filter by categories
      if (filter.categories && filter.categories.length > 0) {
        reports = reports.filter(report => 
          filter.categories!.includes(report.analysis.category)
        );
      }

      // Filter by severities
      if (filter.severities && filter.severities.length > 0) {
        reports = reports.filter(report => 
          filter.severities!.includes(report.analysis.severity)
        );
      }

      // Filter by time range
      if (filter.timeRange) {
        const now = new Date();
        const timeLimit = new Date();
        
        switch (filter.timeRange) {
          case 'hour':
            timeLimit.setHours(now.getHours() - 1);
            break;
          case 'day':
            timeLimit.setDate(now.getDate() - 1);
            break;
          case 'week':
            timeLimit.setDate(now.getDate() - 7);
            break;
          case 'month':
            timeLimit.setMonth(now.getMonth() - 1);
            break;
        }

        reports = reports.filter(report => report.timestamp >= timeLimit);
      }

      // Filter by status
      if (filter.status && filter.status.length > 0) {
        reports = reports.filter(report => 
          filter.status!.includes(report.status)
        );
      }

      // Filter by user ID
      if (filter.userId) {
        reports = reports.filter(report => report.userId === filter.userId);
      }

      return reports;
    } catch (error) {
      console.error('Error filtering reports:', error);
      return [];
    }
  }

  updateReportStatus(reportId: string, status: UserReport['status'], verifiedBy?: string): boolean {
    try {
      const reports = this.getAllReports();
      const reportIndex = reports.findIndex(report => report.id === reportId);
      
      if (reportIndex === -1) return false;

      reports[reportIndex].status = status;
      if (verifiedBy) {
        reports[reportIndex].verifiedBy = verifiedBy;
      }
      if (status === 'resolved') {
        reports[reportIndex].resolvedAt = new Date();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
      return true;
    } catch (error) {
      console.error('Error updating report status:', error);
      return false;
    }
  }

  incrementViews(reportId: string): boolean {
    try {
      const reports = this.getAllReports();
      const reportIndex = reports.findIndex(report => report.id === reportId);
      
      if (reportIndex === -1) return false;

      reports[reportIndex].views += 1;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
      return true;
    } catch (error) {
      console.error('Error incrementing views:', error);
      return false;
    }
  }

  addHelpfulVote(reportId: string): boolean {
    try {
      const reports = this.getAllReports();
      const reportIndex = reports.findIndex(report => report.id === reportId);
      
      if (reportIndex === -1) return false;

      reports[reportIndex].helpfulVotes += 1;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
      return true;
    } catch (error) {
      console.error('Error adding helpful vote:', error);
      return false;
    }
  }

  deleteReport(reportId: string): boolean {
    try {
      const reports = this.getAllReports();
      const filteredReports = reports.filter(report => report.id !== reportId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredReports));
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      return false;
    }
  }

  // Statistics
  getReportStats(): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    byStatus: Record<string, number>;
    recentCount: number;
  } {
    try {
      const reports = this.getAllReports();
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const stats = {
        total: reports.length,
        byCategory: {} as Record<string, number>,
        bySeverity: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        recentCount: reports.filter(r => r.timestamp >= dayAgo).length
      };

      reports.forEach(report => {
        // Count by category
        stats.byCategory[report.analysis.category] = 
          (stats.byCategory[report.analysis.category] || 0) + 1;

        // Count by severity
        stats.bySeverity[report.analysis.severity] = 
          (stats.bySeverity[report.analysis.severity] || 0) + 1;

        // Count by status
        stats.byStatus[report.status] = 
          (stats.byStatus[report.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting report stats:', error);
      return {
        total: 0,
        byCategory: {},
        bySeverity: {},
        byStatus: {},
        recentCount: 0
      };
    }
  }

  // Initialize with sample data if empty
  initializeSampleData(): void {
    try {
      const existingReports = this.getAllReports();
      if (existingReports.length > 0) return;

      const sampleReports: Omit<UserReport, 'id' | 'timestamp' | 'views' | 'helpfulVotes' | 'status'>[] = [
        {
          userId: 'sample_user_1',
          userName: 'Priya Sharma',
          userEmail: 'priya@example.com',
          location: { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bengaluru' },
          media: {
            url: '/placeholder.jpg',
            type: 'image',
            fileName: 'traffic_jam.jpg',
            size: 1024000
          },
          analysis: {
            category: 'traffic',
            severity: 'high',
            description: 'Heavy traffic congestion causing significant delays during peak hours',
            tags: ['congestion', 'peak-hour', 'vehicles', 'delay'],
            confidence: 92,
            suggestedActions: ['Use alternative routes', 'Contact traffic authorities'],
            landmarks: ['MG Road Metro Station', 'Trinity Circle'],
            aiTitle: 'Major Traffic Congestion on MG Road'
          },
          userComments: 'Traffic has been like this for the past 30 minutes. Alternative route via Richmond Road is also congested.'
        },
        {
          userId: 'sample_user_2',
          userName: 'Rajesh Kumar',
          userEmail: 'rajesh@example.com',
          location: { lat: 12.9698, lng: 77.6048, address: 'Koramangala, Bengaluru' },
          media: {
            url: '/placeholder.jpg',
            type: 'image',
            fileName: 'waterlogging.jpg',
            size: 856000
          },
          analysis: {
            category: 'infrastructure',
            severity: 'medium',
            description: 'Water logging on main road due to poor drainage system',
            tags: ['waterlogging', 'drainage', 'rain', 'infrastructure'],
            confidence: 88,
            suggestedActions: ['Report to BBMP', 'Avoid the area', 'Use elevated walkways'],
            landmarks: ['Forum Mall', 'Koramangala Bus Stop'],
            aiTitle: 'Waterlogging Issue Near Forum Mall'
          },
          userComments: 'This happens every time it rains. The drainage system needs urgent attention.'
        }
      ];

      sampleReports.forEach(reportData => {
        this.saveReport(reportData);
      });

      console.log('Sample data initialized');
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  // Clear all data (for testing)
  clearAllData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.USER_KEY);
      console.log('All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export const reportStorage = new ReportStorageService();