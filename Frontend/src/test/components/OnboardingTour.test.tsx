import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import React from "react";
import { OnboardingTour, restartOnboardingTour } from "@/components/ui/OnboardingTour";
import { driver } from "driver.js";

// Mock driver.js
const mockDrive = vi.fn();
const mockDestroy = vi.fn();
let lastDriverConfig: any = null;

vi.mock("driver.js", () => ({
  driver: vi.fn((config) => {
    lastDriverConfig = config;
    return {
      drive: mockDrive,
      destroy: mockDestroy,
    };
  }),
}));

describe("OnboardingTour Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastDriverConfig = null;
    localStorage.clear();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("triggers driver for a new company user", () => {
    render(<OnboardingTour userId={42} isCompanyUser={true} />);

    // Fast forward timer for auto start
    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(driver).toHaveBeenCalled();
    expect(mockDrive).toHaveBeenCalledTimes(1);
    expect(lastDriverConfig).toBeDefined();
    expect(lastDriverConfig.steps).toHaveLength(4);
  });

  it("does not trigger driver if user already completed the tour in localStorage", () => {
    localStorage.setItem("becdex_onboarding_completed_42", "true");

    render(<OnboardingTour userId={42} isCompanyUser={true} />);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(mockDrive).not.toHaveBeenCalled();
  });

  it("does not auto trigger for non-company user (admin)", () => {
    render(<OnboardingTour userId={1} isCompanyUser={false} />);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(mockDrive).not.toHaveBeenCalled();
  });

  it("persists completion to localStorage when onCloseClick is fired", () => {
    render(<OnboardingTour userId={42} isCompanyUser={true} />);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(lastDriverConfig.onCloseClick).toBeDefined();

    // Simulate user clicking close
    act(() => {
      lastDriverConfig.onCloseClick();
    });

    expect(mockDestroy).toHaveBeenCalled();
    expect(localStorage.getItem("becdex_onboarding_completed_42")).toBe("true");
  });

  it("persists completion to localStorage when onDestroyed is fired", () => {
    render(<OnboardingTour userId={42} isCompanyUser={true} />);

    act(() => {
      vi.advanceTimersByTime(700);
    });

    expect(lastDriverConfig.onDestroyed).toBeDefined();

    act(() => {
      lastDriverConfig.onDestroyed();
    });

    expect(localStorage.getItem("becdex_onboarding_completed_42")).toBe("true");
  });

  it("restarts tour when custom event is dispatched", () => {
    localStorage.setItem("becdex_onboarding_completed_42", "true");

    render(<OnboardingTour userId={42} isCompanyUser={true} />);

    act(() => {
      vi.advanceTimersByTime(700);
    });
    expect(mockDrive).not.toHaveBeenCalled();

    // Trigger restart via event
    act(() => {
      window.dispatchEvent(new CustomEvent("becdex:restart-onboarding-tour"));
    });

    expect(mockDrive).toHaveBeenCalledTimes(1);
  });

  it("restartOnboardingTour helper dispatches custom event on dashboard", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    // Simulate current window location pathname
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard", href: "http://localhost/dashboard" },
      writable: true,
    });

    restartOnboardingTour();

    expect(dispatchSpy).toHaveBeenCalled();
  });

  it("restartOnboardingTour helper redirects with ?tour=start on other pages", () => {
    Object.defineProperty(window, "location", {
      value: { pathname: "/dashboard/guide", href: "http://localhost/dashboard/guide" },
      writable: true,
    });

    const mockRouter = {
      push: vi.fn(),
    } as any;

    restartOnboardingTour(mockRouter);

    expect(sessionStorage.getItem("becdex_restart_tour")).toBe("1");
    expect(mockRouter.push).toHaveBeenCalledWith("/dashboard?tour=start");
  });
});
