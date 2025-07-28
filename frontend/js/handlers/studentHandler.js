// Student Action Handler Module
export class StudentHandler {
  static handleAction(action) {
    switch (action) {
      case "view-lessons":
        this.viewLessons();
        break;
      case "view-progress":
        this.viewProgress();
        break;
      case "view-exams":
        this.viewExams();
        break;
      default:
        this.showFeatureComingSoon();
    }
  }

  static viewLessons() {
    alert("Feature coming soon: Access course lessons and content");
  }

  static viewProgress() {
    alert("Feature coming soon: View your completion percentage and grades");
  }

  static viewExams() {
    alert("Feature coming soon: Take exams and view results");
  }

  static showFeatureComingSoon() {
    alert("Feature coming soon");
  }
}
