// src/services/notification.service.js
import { placeholderIcons } from "../utils/iconUtils";

/**
 * Service to handle application notifications
 * This keeps notification logic separate from components
 */
class NotificationService {
  /**
   * Show welcome notification after login
   * @param {Object} params - Parameters for the welcome notification
   * @param {Object} notificationContext - The notification context from useNotification()
   * @returns {string|null} The notification ID if shown
   */
  static showWelcomeNotification(
    {
      username = "User",
      unfinishedGames = [],
      isFirstLoginOfDay = false,
      lastLoginTime = null,
      openGameCallback = null,
      openDocumentsCallback = null,
    },
    notificationContext
  ) {
    if (!notificationContext || !notificationContext.showInfo) return null;

    const { showSystemMessage, showInfo } = notificationContext;
    const display = isFirstLoginOfDay ? showSystemMessage : showInfo;

    if (isFirstLoginOfDay) {
      // First login of the day gets a special welcome
      return display(
        `Welcome back, ${username}! ${
          unfinishedGames.length > 0
            ? `You have ${unfinishedGames.length} unfinished adventure${
                unfinishedGames.length !== 1 ? "s" : ""
              }.`
            : "Ready for a new adventure today?"
        }`,
        {
          title: "Windows 95 Text Adventure",
          timeout: 8000,
          icon: placeholderIcons.adventure,
          actions:
            unfinishedGames.length > 0
              ? [
                  {
                    label: "Continue Latest",
                    primary: true,
                    onClick: () =>
                      openGameCallback &&
                      openGameCallback(unfinishedGames[0].id),
                  },
                  {
                    label: "View All",
                    onClick: () =>
                      openDocumentsCallback && openDocumentsCallback("active"),
                  },
                ]
              : [
                  {
                    label: "New Adventure",
                    primary: true,
                    onClick: () => openGameCallback && openGameCallback(),
                  },
                  {
                    label: "Browse Stories",
                    onClick: () =>
                      openDocumentsCallback && openDocumentsCallback(),
                  },
                ],
        }
      );
    } else {
      // Returning user gets a simpler welcome
      return display(
        `Welcome back, ${username}!${
          unfinishedGames.length > 0
            ? ` You have ${unfinishedGames.length} unfinished adventure${
                unfinishedGames.length !== 1 ? "s" : ""
              }.`
            : ""
        }`,
        {
          title: "Windows 95 Text Adventure",
          timeout: 4000,
          icon: placeholderIcons.adventure,
        }
      );
    }
  }

  /**
   * Show notification about game auto-save
   * @param {Object} params - Parameters for the auto-save notification
   * @param {Object} notificationContext - The notification context from useNotification()
   * @returns {string|null} The notification ID if shown
   */
  static showAutoSaveNotification(
    { gameId = null, timestamp = new Date() },
    notificationContext
  ) {
    if (!notificationContext || !notificationContext.showInfo) return null;

    const { showInfo } = notificationContext;

    return showInfo("Game progress saved", {
      title: "Autosave",
      timeout: 2000,
      animate: false, // No progress bar animation for subtle notification
      style: {
        header: {
          background: "#4682B4", // Slightly different color for auto-save notifications
        },
      },
    });
  }

  /**
   * Show notification for manual game save
   * @param {Object} params - Parameters for the manual save notification
   * @param {Object} notificationContext - The notification context from useNotification()
   * @returns {string|null} The notification ID if shown
   */
  static showManualSaveNotification(
    { gameId = null, timestamp = new Date() },
    notificationContext
  ) {
    if (!notificationContext || !notificationContext.showSuccess) return null;

    const { showSuccess } = notificationContext;
    const saveTime = timestamp.toLocaleTimeString();

    return showSuccess(`Game progress saved at ${saveTime}`, {
      title: "Game Saved",
      timeout: 3000,
      icon: placeholderIcons.adventure,
    });
  }

  /**
   * Show notification for game achievements
   * @param {Object} params - Parameters for the achievement notification
   * @param {Object} notificationContext - The notification context from useNotification()
   * @returns {string|null} The notification ID if shown
   */
  static showAchievementNotification(
    {
      title = "Achievement Unlocked",
      message = "You've unlocked a new achievement!",
      gameId = null,
      achievementId = null,
    },
    notificationContext
  ) {
    if (!notificationContext || !notificationContext.showAchievement)
      return null;

    const { showAchievement } = notificationContext;

    return showAchievement(message, {
      title: title,
      timeout: 8000,
      icon: placeholderIcons.achievement || placeholderIcons.adventure,
    });
  }

  /**
   * Show error notification with retry option
   * @param {Object} params - Parameters for the error notification
   * @param {Object} notificationContext - The notification context from useNotification()
   * @returns {string|null} The notification ID if shown
   */
  static showErrorWithRetryNotification(
    {
      title = "Error",
      message = "An error occurred",
      operation = "operation",
      retryCallback = null,
      cancelCallback = null,
    },
    notificationContext
  ) {
    if (!notificationContext || !notificationContext.showError) return null;

    const { showError } = notificationContext;

    return showError(message, {
      title: title,
      timeout: 0, // Don't auto-dismiss errors with retry options
      actions: [
        {
          label: "Retry",
          primary: true,
          onClick: () => retryCallback && retryCallback(),
        },
        {
          label: "Cancel",
          onClick: () => cancelCallback && cancelCallback(),
        },
      ],
    });
  }

  /**
   * Show game completion notification
   * @param {Object} params - Parameters for the completion notification
   * @param {Object} notificationContext - The notification context from useNotification()
   * @returns {string|null} The notification ID if shown
   */
  static showGameCompletionNotification(
    {
      gameTitle = "adventure",
      stats = {},
      newGameCallback = null,
      viewStatsCallback = null,
    },
    notificationContext
  ) {
    if (!notificationContext || !notificationContext.showAchievement)
      return null;

    const { showAchievement, showInfo } = notificationContext;

    // First show completion achievement
    const achievementId = showAchievement(
      `Congratulations! You've completed "${gameTitle}"!`,
      {
        title: "Adventure Completed",
        timeout: 8000,
        icon: placeholderIcons.achievement || placeholderIcons.adventure,
        actions: [
          {
            label: "New Adventure",
            primary: true,
            onClick: () => newGameCallback && newGameCallback(),
          },
        ],
      }
    );

    // Then show stats after a delay
    setTimeout(() => {
      if (showInfo) {
        showInfo(
          `Adventure stats:\n` +
            `• Story length: ${stats.turnCount || 0} turns\n` +
            `• Custom choices: ${stats.customChoices || 0}\n` +
            `• Time spent: ${stats.timeSpent || "Unknown"}`,
          {
            title: "Adventure Statistics",
            timeout: 10000,
            actions: viewStatsCallback
              ? [
                  {
                    label: "View Details",
                    onClick: () => viewStatsCallback(),
                  },
                ]
              : [],
          }
        );
      }
    }, 1500);

    return achievementId;
  }
}

export default NotificationService;
