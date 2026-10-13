<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import BaseLayout from '../../BaseLayout.vue';
import BaseInput from '../../UI/BaseInput.vue';
import WrapperContainer from '../../UI/WrapperContainer.vue';
import BaseButton from '../../UI/BaseButton.vue';
import { useImportData } from '../../../composables/useImportData';
import BaseIcon from '../../UI/BaseIcon.vue';
import { columnToIndex, indexToColumn } from '../../../utils/convert';
import { TransactionTypes, type Transaction } from '../../../types/finances';
import { useCurrentFinanceStore } from '../../../stores/financeStoreRegistry';
import { storeToRefs } from 'pinia';
import BaseSelect from '../../UI/BaseSelect.vue';
import { useAsyncAction } from '../../../composables/useAsyncAction';
import { rowToTransaction, saveTransactionsToSpreadsheet } from '../../../services/transactions';
import type { SpreadsheetValue } from '../../../types/spreadsheet';
import { sheetDateToStringDate } from '../../../utils/date';
import { useRouter } from 'vue-router';

type Steps = 'start' | 'tabs' | 'range' | 'categories' | 'years' | 'finish';

const router = useRouter();
const action = useAsyncAction();
const { isError, isLoading, execute, clearState } = action;

const step = ref<Steps>('start');
const link = ref('');
const invalidLink = ref(false);

const importData = useImportData();
const { setSpreadsheetId, tabs, getTabs, getRawValuesFromTab, rawData, numberOfRawDataColums } = importData;

const parseLink = (link: string): string | undefined => {
  const match = link.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);

  return match?.[1];
};

const handleStartImport = async () => {
  invalidLink.value = false;

  const spreadsheetId = parseLink(link.value);

  if (!spreadsheetId) {
    invalidLink.value = true;
    return;
  }

  setSpreadsheetId(spreadsheetId);
  await execute(getTabs);

  step.value = 'tabs';
};

const handleSelectTab = async (tabTitle: string) => {
  await execute(() => getRawValuesFromTab(tabTitle));
  step.value = 'range';
};

const isTransactionTypeSet = ref(false);
const dataMapping = reactive({
  startRow: '',
  dateColumn: '',
  amountColumn: '',
  categoryColumn: '',
  commentColumn: '',
  typeColumn: '',
  transactionType: '',
});
const dataMappingTemp = reactive({ ...dataMapping });

const tempToStored = (keys: (keyof typeof dataMapping)[]) => {
  keys.forEach((key) => {
    dataMapping[key] = dataMappingTemp[key];
  });
};

const importedTransactions = computed(() => {
  if (!dataMapping.startRow) return [];

  return rawData.value.filter((_, index) => index >= +dataMapping.startRow);
});

const getUniqueValuesByColumn = <T extends SpreadsheetValue>(column: string) => {
  if (!column) return [];

  return Array.from(
    importedTransactions.value.reduce((acc, transaction) => {
      const index = columnToIndex(column);
      const value = transaction[index];

      if (value == null) return acc;

      acc.add(value as T);

      return acc;
    }, new Set<T>()),
  );
};

const importedCategories = computed(() => getUniqueValuesByColumn<string>(dataMapping.categoryColumn));

const importedTypes = computed(() => getUniqueValuesByColumn<string>(dataMapping.typeColumn));

const categoriesMapping = ref<Record<string, string>>({});
const typesMapping = ref<Record<string, string>>({});

const financeStore = useCurrentFinanceStore();
const { incomeCategoriesTitles, spendingCategoriesTitles, transactionsCount } = storeToRefs(financeStore);

const categoriesOptions = computed(() => {
  if (dataMapping.transactionType === TransactionTypes.INCOME) return incomeCategoriesTitles.value;

  if (dataMapping.transactionType === TransactionTypes.SPENDING) return spendingCategoriesTitles.value;

  return [...incomeCategoriesTitles.value, ...spendingCategoriesTitles.value];
});

const handleImportFinish = async () => {
  const transactions: Transaction[] = importedTransactions.value
    .map((row) => {
      const id = crypto.randomUUID();
      const date = row[columnToIndex(dataMapping.dateColumn)];
      const amount = row[columnToIndex(dataMapping.amountColumn)];
      const comment = row[columnToIndex(dataMapping.commentColumn)];
      const category = categoriesMapping.value[row[columnToIndex(dataMapping.categoryColumn)] as string];
      const type = dataMapping.typeColumn
        ? typesMapping.value[row[columnToIndex(dataMapping.typeColumn)] as string]
        : dataMapping.transactionType;

      return rowToTransaction([id, date, type, category, amount, comment]);
    })
    .filter((transaction) => transaction != null);

  const startRowIndex = transactionsCount.value + 1;

  await execute(() => saveTransactionsToSpreadsheet(financeStore.getContext(), transactions, startRowIndex));

  step.value = 'years';
};

const handleCreateYearTabs = async () => {
  isLoading.value = true;

  const transactionYears = getUniqueValuesByColumn<number>(dataMapping.dateColumn).reduce((acc, date) => {
    const dateString = sheetDateToStringDate(date);

    if (!dateString) return acc;

    const year = dateString.slice(0, 4);
    acc.add(year);

    return acc;
  }, new Set<string>());

  await execute(() =>
    Promise.all([...transactionYears].map((year) => financeStore.checkYearExistanceInSpreadsheet(year))),
  );

  if (!isError.value) step.value = 'finish';
};

const resetMappings = () => {
  Object.keys(dataMapping).forEach((key) => {
    dataMapping[key as keyof typeof dataMapping] = '';
    dataMappingTemp[key as keyof typeof dataMapping] = '';
  });
  categoriesMapping.value = {};
  typesMapping.value = {};
};

const resetAll = () => {
  link.value = '';
  resetMappings();
  step.value = 'start';
  clearState();
};
</script>

<template>
  <BaseLayout title="Import data">
    <WrapperContainer v-if="isLoading" role="status">
      <span class="sr-only">Restoring session</span>
      <BaseIcon icon="arrow-clockwise" class="animate-spin mx-auto" />
    </WrapperContainer>

    <WrapperContainer v-else-if="isError" :gap="4">
      <div class="text-red-primary">Something went wrong...</div>
      <BaseButton @click="resetAll">Try again</BaseButton>
    </WrapperContainer>

    <template v-else>
      <!-- STEP 1 -->
      <WrapperContainer v-if="step === 'start'" :gap="4">
        <div>Paste the link to the Google Sheet from which to import the data.</div>

        <BaseInput
          v-model="link"
          name="link"
          placeholder="https://docs.google.com/spreadsheets/..."
          aria-label="import link"
        />

        <div v-if="invalidLink" class="text-red-primary text-sm">Invalid link</div>

        <BaseButton :disabled="!link" @click="handleStartImport">Import data</BaseButton>
      </WrapperContainer>

      <!-- STEP 2 -->
      <WrapperContainer v-if="step === 'tabs'" :gap="4">
        <div>Choose the tab from which to import the data.</div>

        <div class="flex flex-col gap-2">
          <BaseButton v-for="tab in tabs" :key="tab.title" visual="link" @click="handleSelectTab(tab.title)">
            {{ tab.title }}
          </BaseButton>
        </div>
      </WrapperContainer>

      <!-- STEP 3 -->
      <template v-if="step === 'range'">
        <WrapperContainer v-if="dataMapping.startRow === ''" :gap="4">
          <div>From which line do the data begin?</div>

          <BaseInput
            v-model="dataMappingTemp.startRow"
            name="rowIndex"
            type="number"
            aria-label="row start index"
            placeholder="0"
          />

          <BaseButton :disabled="dataMappingTemp.startRow === ''" @click="tempToStored(['startRow'])">Next</BaseButton>
        </WrapperContainer>

        <WrapperContainer
          v-else-if="
            !dataMapping.dateColumn ||
            !dataMapping.amountColumn ||
            !dataMapping.categoryColumn ||
            !dataMapping.commentColumn
          "
          :gap="4"
        >
          <div>Which columns correspond to the data?</div>

          <div class="grid grid-cols-[1fr_1fr] gap-2">
            <div>Date</div>
            <BaseInput v-model="dataMappingTemp.dateColumn" name="mappingDate" placeholder="A" />
            <div>Amount</div>
            <BaseInput v-model="dataMappingTemp.amountColumn" name="mappingAmount" placeholder="B" />
            <div>Category</div>
            <BaseInput v-model="dataMappingTemp.categoryColumn" name="mappingCategory" placeholder="C" />
            <div>Comment</div>
            <BaseInput v-model="dataMappingTemp.commentColumn" name="mappingComment" placeholder="D" />
            <div>Transaction type</div>
            <BaseInput v-model="dataMappingTemp.typeColumn" name="mappingType" placeholder="Not necessarily" />
          </div>

          <BaseButton
            :disabled="
              !dataMappingTemp.dateColumn ||
              !dataMappingTemp.amountColumn ||
              !dataMappingTemp.categoryColumn ||
              !dataMappingTemp.commentColumn
            "
            @click="tempToStored(['dateColumn', 'amountColumn', 'categoryColumn', 'commentColumn', 'typeColumn'])"
          >
            Next
          </BaseButton>
        </WrapperContainer>

        <WrapperContainer v-else-if="!dataMapping.typeColumn && !dataMapping.transactionType" :gap="4">
          <div>Choose transaction type for all imported transactions.</div>

          <BaseButton @click="dataMapping.transactionType = TransactionTypes.SPENDING">
            Import as 'Spending'
          </BaseButton>

          <BaseButton @click="dataMapping.transactionType = TransactionTypes.INCOME"> Import as 'Income' </BaseButton>
        </WrapperContainer>

        <WrapperContainer
          v-else-if="dataMapping.typeColumn && !isTransactionTypeSet"
          :gap="4"
          class="flex-grow overflow-hidden min-h-[50dvh]"
        >
          <div>Set up transaction types mapping</div>

          <div class="grid grid-cols-[1fr_1fr] gap-2 flex-grow overflow-y-scroll">
            <template v-for="type in importedTypes" :key="type">
              <div>{{ type }}</div>

              <BaseSelect v-model="typesMapping[type]" :options="['spending', 'income']" :name="`${type}Mapping`" />
            </template>
          </div>

          <BaseButton @click="isTransactionTypeSet = true"> Next </BaseButton>
        </WrapperContainer>

        <WrapperContainer v-else :gap="2">
          <div>Is everything correct?</div>

          <div class="grid grid-cols-[1fr_1fr] gap-1">
            <div>Start row</div>
            <div>{{ dataMappingTemp.startRow }}</div>
            <div>Date column</div>
            <div>{{ dataMappingTemp.dateColumn }}</div>
            <div>Amount column</div>
            <div>{{ dataMappingTemp.amountColumn }}</div>
            <div>Category column</div>
            <div>{{ dataMappingTemp.categoryColumn }}</div>
            <div>Comment column</div>
            <div>{{ dataMappingTemp.commentColumn }}</div>
            <div>Transaction type</div>
            <div>{{ dataMapping.typeColumn || dataMapping.transactionType }}</div>
          </div>
          <div class="flex gap-4 justify-between">
            <BaseButton visual="link" @click="resetMappings">No</BaseButton>
            <BaseButton @click="step = 'categories'">Yes</BaseButton>
          </div>
        </WrapperContainer>

        <WrapperContainer class="flex-grow min-h-0">
          <div class="relative max-h-full overflow-y-auto">
            <table class="table-auto">
              <thead class="sticky bg-dark-secondary top-0">
                <tr>
                  <th></th>
                  <th v-for="index in numberOfRawDataColums" :key="index">{{ indexToColumn(index - 1) }}</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(row, index) in rawData" :key="index">
                  <td class="text-center">
                    <b>{{ index + 1 }}</b>
                  </td>
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">
                    <div class="line-clamp-2">{{ cell }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </WrapperContainer>
      </template>

      <!-- STEP 4 -->
      <WrapperContainer v-if="step === 'categories'" class="max-h-100% flex flex-col overflow-hidden" :gap="4">
        <div>Set up categories mapping.</div>

        <div class="flex-grow overflow-y-auto grid grid-cols-[1fr_1fr] gap-2">
          <template v-for="category in importedCategories" :key="category">
            <div>{{ category }}</div>

            <BaseSelect
              v-model="categoriesMapping[category]"
              :name="`${category}Select`"
              :options="categoriesOptions"
              :aria-label="`${category} mapping select`"
            />
          </template>
        </div>

        <BaseButton
          :disabled="Object.keys(categoriesMapping).length < importedCategories.length"
          @click="handleImportFinish"
        >
          Import transactions
        </BaseButton>
      </WrapperContainer>

      <WrapperContainer v-if="step === 'years'" :gap="4">
        <div class="text-green-primary">Successfully imported {{ importedTransactions.length }} transactions!</div>

        <div>Would you like to create year tabs in the spreadsheet?</div>

        <div class="flex gap-4 justify-between">
          <BaseButton visual="link" @click="resetAll">No</BaseButton>
          <BaseButton @click="handleCreateYearTabs">Yes</BaseButton>
        </div>
      </WrapperContainer>

      <WrapperContainer v-if="step === 'finish'" :gap="4">
        <div class="text-green-primary">Successfully created years tabs!</div>

        <BaseButton visual="link" @click="resetAll">Import new data</BaseButton>

        <BaseButton @click="router.push('/')">Return to the main view</BaseButton>
      </WrapperContainer>
    </template>
  </BaseLayout>
</template>
