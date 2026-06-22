import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AiCommentModal } from "@/features/daily-log/components/AiCommentModal";
import { DailyLogForm } from "@/features/daily-log/components/DailyLogForm";
import { DateSelectModal } from "@/features/daily-log/components/DateSelectModal";
import { DateSelectorButton } from "@/features/daily-log/components/DateSelectorButton";
import { LifestyleFields } from "@/features/daily-log/components/LifestyleFields";
import { SkinConditionSelector } from "@/features/daily-log/components/SkinConditionSelector";
import { UsedItemSelector } from "@/features/daily-log/components/UsedItemSelector";
import type { DailyLogFormValues } from "@/features/daily-log/types";
import type { AiSuggestion, UserItem } from "@/types/models";

const createUserItem = (
  id: string,
  name: string,
  categoryName: string,
  brand = "SkinMate",
): UserItem => ({
  id: `user-${id}`,
  userId: "user-1",
  createdAt: "2026-06-01T00:00:00Z",
  updatedAt: "2026-06-01T00:00:00Z",
  item: {
    id,
    brand,
    name,
    createdAt: "2026-06-01T00:00:00Z",
    updatedAt: "2026-06-01T00:00:00Z",
    category: {
      id: `category-${categoryName}`,
      name: categoryName,
    },
    ingredients: [],
  },
});

const createFormValues = (
  overrides: Partial<DailyLogFormValues> = {},
): DailyLogFormValues => ({
  logDate: "2026-06-21",
  skinCondition: null,
  weather: "",
  sleepLevel: "",
  mealBalance: "",
  freeNote: "",
  isMenstruation: false,
  morningItemIds: [],
  nightItemIds: [],
  ...overrides,
});

describe("Daily-log components", () => {
  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  it("DailyLogForm は肌状態未選択ならエラーを表示する", () => {
    render(
      <DailyLogForm
        initialValues={createFormValues()}
        userItems={[]}
        isSubmitting={false}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "この内容で記録する" }));

    expect(screen.getByText("肌状態を選択してください。")).toBeInTheDocument();
  });

  it("DailyLogForm は選択済みの値を送信する", async () => {
    const onSubmitMock = vi.fn().mockResolvedValue(undefined);
    const values = createFormValues({
      skinCondition: 2,
      weather: "sunny",
      sleepLevel: "normal",
      mealBalance: "good",
      freeNote: "保湿重視",
      isMenstruation: true,
      morningItemIds: ["item-1"],
      nightItemIds: ["item-2"],
    });

    render(
      <DailyLogForm
        initialValues={values}
        userItems={[]}
        isSubmitting={false}
        onSubmit={onSubmitMock}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "この内容で記録する" }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledWith(values);
    });
  });

  it("LifestyleFields は各入力変更をコールバックへ渡す", () => {
    const onChangeMock = vi.fn();

    render(
      <LifestyleFields
        weather=""
        sleepLevel=""
        mealBalance=""
        freeNote=""
        isMenstruation={false}
        onChange={onChangeMock}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "生理がきた" }));
    fireEvent.click(screen.getByRole("button", { name: "晴れ" }));
    fireEvent.change(screen.getByLabelText("睡眠"), {
      target: { value: "long" },
    });
    fireEvent.change(screen.getByLabelText("食事のバランス"), {
      target: { value: "bad" },
    });
    fireEvent.change(screen.getByLabelText("ひとこと日記・気づき"), {
      target: { value: "少し乾燥した" },
    });

    expect(onChangeMock).toHaveBeenNthCalledWith(1, { isMenstruation: true });
    expect(onChangeMock).toHaveBeenNthCalledWith(2, { weather: "sunny" });
    expect(onChangeMock).toHaveBeenNthCalledWith(3, { sleepLevel: "long" });
    expect(onChangeMock).toHaveBeenNthCalledWith(4, { mealBalance: "bad" });
    expect(onChangeMock).toHaveBeenNthCalledWith(5, {
      freeNote: "少し乾燥した",
    });
  });

  it("SkinConditionSelector は選択中の状態を表示し、押下した値を返す", () => {
    const onChangeMock = vi.fn();

    render(<SkinConditionSelector value={2} onChange={onChangeMock} />);

    expect(screen.getByText("普通")).toHaveClass("text-gray-700");

    fireEvent.click(screen.getByRole("button", { name: /良い/ }));

    expect(onChangeMock).toHaveBeenCalledWith(3);
  });

  it("UsedItemSelector はカテゴリで絞り込みつつ選択結果を確定できる", async () => {
    const onChangeMock = vi.fn();
    const userItems = [
      createUserItem("item-1", "モーニングローション", "化粧水"),
      createUserItem("item-2", "ナイトセラム", "美容液"),
    ];

    render(
      <UsedItemSelector
        timeOfDay="morning"
        title="朝のケア"
        userItems={userItems}
        selectedItemIds={["item-1"]}
        onChange={onChangeMock}
      />,
    );

    expect(screen.getByText("モーニングローション")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /朝のケアを登録/ }));
    fireEvent.click(screen.getByRole("button", { name: "美容液" }));
    fireEvent.click(screen.getByRole("button", { name: /ナイトセラム/ }));
    fireEvent.click(screen.getByRole("button", { name: "決定" }));

    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith(["item-1", "item-2"]);
    });
  });

  it("DateSelectorButton は今日の日付ラベルを表示してクリックできる", () => {
    const onClickMock = vi.fn();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-21T12:00:00Z"));

    render(
      <DateSelectorButton logDate="2026-06-21" onClick={onClickMock} />,
    );

    const button = screen.getByRole("button");

    expect(button).toHaveTextContent("今日（6月21日（日））");

    fireEvent.click(button);

    expect(onClickMock).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("DateSelectModal は日付選択時に onSelect と onClose を呼ぶ", () => {
    const onSelectMock = vi.fn();
    const onCloseMock = vi.fn();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-21T12:00:00Z"));

    render(
      <DateSelectModal
        isOpen
        selectedDate="2026-06-21"
        onSelect={onSelectMock}
        onClose={onCloseMock}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "今日（6月21日（日））" }));

    expect(onSelectMock).toHaveBeenCalledWith("2026-06-21");
    expect(onCloseMock).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("AiCommentModal は生成中の表示とボタン無効化を行う", () => {
    render(
      <AiCommentModal
        isOpen
        suggestion={null}
        isGenerating
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText("AIコメントを生成中です...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "AIコメント生成中..." }),
    ).toBeDisabled();
  });

  it("AiCommentModal は提案本文を表示して閉じる操作を受け付ける", () => {
    const onCloseMock = vi.fn();
    const suggestion: AiSuggestion = {
      id: "ai-1",
      userId: "user-1",
      suggestedAt: "2026-06-21T12:00:00Z",
      suggestionType: "daily_comment",
      title: "保湿を意識しましょう",
      body: "今日は刺激の少ないケアがおすすめです。",
      createdAt: "2026-06-21T12:00:00Z",
    };

    render(
      <AiCommentModal
        isOpen
        suggestion={suggestion}
        isGenerating={false}
        onClose={onCloseMock}
      />,
    );

    expect(screen.getByText("保湿を意識しましょう")).toBeInTheDocument();
    expect(
      screen.getByText("今日は刺激の少ないケアがおすすめです。"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "ホームに戻る" }));

    expect(onCloseMock).toHaveBeenCalled();
  });
});
