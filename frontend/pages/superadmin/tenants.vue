<template>
  <div class="sa-page">
    <!-- ===== Header ===== -->
    <div class="sa-header">
      <div class="sa-header__left">
        <div class="sa-header__title-icon">
          <v-icon size="26">mdi-domain</v-icon>
        </div>
        <div>
          <h1 class="text-h5 font-weight-bold">Tenant Management</h1>
          <p class="text-body-2 text-medium-emphasis">Manage all workspaces — plans, limits, lifecycle, domains and branding</p>
        </div>
      </div>
      <div class="sa-header__actions">
        <v-btn color="primary" prepend-icon="mdi-account-plus-outline" @click="openCreate">New Tenant</v-btn>
        <v-btn variant="outlined" prepend-icon="mdi-open-in-new" to="/superadmin">Dashboard</v-btn>
        <v-btn variant="tonal" prepend-icon="mdi-refresh" :loading="loading" @click="loadTenants">Refresh</v-btn>
      </div>
    </div>

    <!-- ===== KPI Cards ===== -->
    <div class="sa-kpi-grid" style="grid-template-columns: repeat(6, 1fr)">
      <div class="sa-kpi">
        <div class="sa-kpi__top">
          <span class="sa-kpi__label">Total</span>
          <div class="sa-kpi__icon sa-kpi__icon--primary"><v-icon size="18">mdi-domain</v-icon></div>
        </div>
        <p class="sa-kpi__value">{{ tenants.length }}</p>
        <div class="sa-kpi__sub">{{ stats.new_this_month ?? 0 }} new this month</div>
      </div>
      <div class="sa-kpi">
        <div class="sa-kpi__top">
          <span class="sa-kpi__label">Active</span>
          <div class="sa-kpi__icon sa-kpi__icon--success"><v-icon size="18">mdi-check-circle</v-icon></div>
        </div>
        <p class="sa-kpi__value text-success">{{ countByStatus('active') }}</p>
        <div class="sa-kpi__sub">{{ activePct }}% of total</div>
      </div>
      <div class="sa-kpi">
        <div class="sa-kpi__top">
          <span class="sa-kpi__label">Trial</span>
          <div class="sa-kpi__icon sa-kpi__icon--info"><v-icon size="18">mdi-clock-outline</v-icon></div>
        </div>
        <p class="sa-kpi__value text-info">{{ countByStatus('trial') }}</p>
        <div class="sa-kpi__sub">{{ trialExpiringCount }} expiring soon</div>
      </div>
      <div class="sa-kpi">
        <div class="sa-kpi__top">
          <span class="sa-kpi__label">Suspended</span>
          <div class="sa-kpi__icon sa-kpi__icon--warning"><v-icon size="18">mdi-pause-circle</v-icon></div>
        </div>
        <p class="sa-kpi__value text-warning">{{ countByStatus('suspended') }}</p>
        <div class="sa-kpi__sub">Temporarily disabled</div>
      </div>
      <div class="sa-kpi">
        <div class="sa-kpi__top">
          <span class="sa-kpi__label">Cancelled</span>
          <div class="sa-kpi__icon sa-kpi__icon--error"><v-icon size="18">mdi-close-circle</v-icon></div>
        </div>
        <p class="sa-kpi__value text-error">{{ countByStatus('cancelled') }}</p>
        <div class="sa-kpi__sub">No longer active</div>
      </div>
      <div class="sa-kpi">
        <div class="sa-kpi__top">
          <span class="sa-kpi__label">Est. MRR</span>
          <div class="sa-kpi__icon sa-kpi__icon--teal"><v-icon size="18">mdi-cash-multiple</v-icon></div>
        </div>
        <p class="sa-kpi__value">KSh {{ formatNum(totalMRR) }}</p>
        <div class="sa-kpi__sub">Projected monthly revenue</div>
      </div>
    </div>

    <!-- ===== Loading ===== -->
    <div v-if="loading && tenants.length === 0" class="sa-skeleton">
      <v-skeleton-loader type="table-tbody" class="sa-skel-table" boilerplate />
    </div>

    <template v-else>
      <!-- ===== Tenants Table ===== -->
      <div class="sa-card">
        <div class="sa-card__header">
          <div class="sa-card__header-icon sa-card__header-icon--indigo">
            <v-icon size="20">mdi-domain</v-icon>
          </div>
          <div>
            <h3 class="sa-card__title">All Tenants</h3>
            <p class="sa-card__subtitle">{{ filteredTenants.length }} of {{ tenants.length }} tenants</p>
          </div>
          <v-spacer />
          <v-text-field
            v-model="search"
            density="compact"
            variant="outlined"
            placeholder="Search tenants..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            class="sa-search"
            style="max-width: 240px"
          />
          <v-select
            v-model="statusFilter"
            density="compact"
            variant="outlined"
            :items="statusOptions"
            hide-details
            class="sa-filter"
            style="max-width: 150px"
          />
          <v-select
            v-model="planFilter"
            density="compact"
            variant="outlined"
            :items="planOptions"
            hide-details
            class="sa-filter"
            style="max-width: 150px"
          />
        </div>

        <!-- Bulk action bar -->
        <div v-if="selectedIds.length" class="sa-bulk-bar">
          <span class="text-body-2 font-weight-medium">{{ selectedIds.length }} selected</span>
          <v-spacer />
          <v-btn size="small" variant="tonal" color="success" prepend-icon="mdi-play" :loading="bulkLoading" @click="bulkAction('activate')">Activate</v-btn>
          <v-btn size="small" variant="tonal" color="warning" prepend-icon="mdi-pause" :loading="bulkLoading" @click="bulkAction('suspend')">Suspend</v-btn>
          <v-btn size="small" variant="tonal" color="error" prepend-icon="mdi-cancel" :loading="bulkLoading" @click="bulkAction('cancel')">Cancel</v-btn>
          <v-btn size="small" variant="text" @click="selectedIds = []">Clear</v-btn>
        </div>

        <v-data-table
          v-model="selectedIds"
          :headers="headers"
          :items="filteredTenants"
          :items-per-page="15"
          density="comfortable"
          hover
          show-select
          return-object
          @click:row="openDetail"
        >
          <template #item.name="{ item }">
            <div class="d-flex align-center ga-2">
              <div class="sa-tenant-row__avatar" :style="avatarStyle(item.name)">
                {{ item.name?.charAt(0)?.toUpperCase() }}
              </div>
              <div style="min-width: 0">
                <p class="text-body-2 font-weight-medium" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px">{{ item.name }}</p>
                <p class="text-caption text-medium-emphasis" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px">{{ item.contact_email }}</p>
              </div>
            </div>
          </template>

          <template #item.plan="{ item }">
            <v-chip :color="planColor(item.plan)" size="small" variant="tonal" label>{{ item.plan }}</v-chip>
          </template>

          <template #item.status="{ item }">
            <div class="d-flex align-center ga-1">
              <div class="sa-status-dot" :class="'sa-status-dot--' + item.status" />
              <span class="text-body-2 text-capitalize">{{ item.status }}</span>
            </div>
          </template>

          <template #item.limits="{ item }">
            <span class="text-body-2 text-medium-emphasis">
              {{ item.max_branches }}b / {{ item.max_users }}u / {{ item.max_products }}p
            </span>
          </template>

          <template #item.trial="{ item }">
            <span v-if="item.on_trial && item.trial_ends_at" class="text-body-2">
              <v-icon size="14" :color="trialColor(item)">{{ trialIcon(item) }}</v-icon>
              {{ item.days_to_trial_end }}d left
            </span>
            <span v-else class="text-body-2 text-medium-emphasis">—</span>
          </template>

          <template #item.mrr_estimate="{ item }">
            <span class="text-body-2 font-weight-medium">KSh {{ formatNum(item.mrr_estimate) }}</span>
          </template>

          <template #item.created_on="{ item }">
            <span class="text-body-2 text-medium-emphasis">{{ formatDate(item.created_on) }}</span>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-1" @click.stop>
              <v-btn size="small" variant="text" icon="mdi-pencil-outline" @click="openEdit(item)" />
              <v-menu>
                <template #activator="{ props }">
                  <v-btn v-bind="props" size="small" variant="text" icon="mdi-dots-vertical" />
                </template>
                <v-list density="compact">
                  <v-list-item prepend-icon="mdi-eye-outline" title="View Details" @click="openDetail(item)" />
                  <v-list-item prepend-icon="mdi-pencil-outline" title="Edit Profile" @click="openEdit(item)" />
                  <v-divider class="my-1" />
                  <v-list-item
                    v-if="item.status !== 'suspended'"
                    prepend-icon="mdi-pause" title="Suspend"
                    @click="suspendTenant(item)"
                  />
                  <v-list-item
                    v-if="item.status !== 'active'"
                    prepend-icon="mdi-play" title="Activate"
                    @click="activateTenant(item)"
                  />
                  <v-list-item
                    v-if="item.status !== 'cancelled'"
                    prepend-icon="mdi-cancel" title="Cancel"
                    @click="cancelTenant(item)"
                  />
                  <v-divider class="my-1" />
                  <v-list-item prepend-icon="mdi-web-plus" title="Add Domain" @click="openDomainDialog(item)" />
                  <v-list-item prepend-icon="mdi-note-edit-outline" title="Edit Notes" @click="openNotesDialog(item)" />
                </v-list>
              </v-menu>
            </div>
          </template>

          <template #no-data>
            <div class="sa-empty">
              <v-icon size="48" color="grey-lighten-1">mdi-domain-off</v-icon>
              <p class="text-body-1 text-medium-emphasis mt-2">No tenants found</p>
            </div>
          </template>
        </v-data-table>
      </div>
    </template>

    <!-- ===== Detail Drawer ===== -->
    <v-navigation-drawer
      v-model="drawerOpen"
      location="right"
      width="560"
      temporary
      class="sa-drawer"
    >
      <template v-if="selected">
        <!-- Drawer Header -->
        <div class="sa-drawer__header">
          <div class="d-flex align-center ga-3">
            <div class="sa-tenant-row__avatar" :style="avatarStyle(selected.name)" style="width:48px;height:48px;font-size:1.2rem;flex-shrink:0">
              {{ selected.name?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="flex-grow-1" style="min-width:0">
              <h3 class="text-h6 font-weight-bold" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ selected.name }}</h3>
              <p class="text-caption text-medium-emphasis" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ selected.contact_email || '—' }}</p>
            </div>
            <v-btn icon="mdi-close" variant="text" size="small" @click="drawerOpen = false" />
          </div>
          <div class="d-flex ga-2 mt-3 flex-wrap">
            <v-chip :color="planColor(selected.plan)" size="small" variant="tonal" label>{{ selected.plan }}</v-chip>
            <div class="d-flex align-center ga-1">
              <div class="sa-status-dot" :class="'sa-status-dot--' + selected.status" />
              <span class="text-body-2 text-capitalize">{{ selected.status }}</span>
            </div>
            <v-chip v-if="selected.on_trial" size="small" variant="tonal" color="info" label>
              {{ selected.days_to_trial_end }}d trial left
            </v-chip>
          </div>
        </div>

        <!-- Tabs -->
        <v-tabs v-model="detailTab" density="compact" color="primary" grow>
          <v-tab value="overview" prepend-icon="mdi-information-outline">Overview</v-tab>
          <v-tab value="manage" prepend-icon="mdi-tune-variant">Manage</v-tab>
          <v-tab value="users" prepend-icon="mdi-account-group">Users</v-tab>
          <v-tab value="domains" prepend-icon="mdi-web">Domains</v-tab>
          <v-tab value="activity" prepend-icon="mdi-history">Activity</v-tab>
          <v-tab value="billing" prepend-icon="mdi-cash-multiple">Billing</v-tab>
        </v-tabs>

        <div class="sa-drawer__body">
          <v-window v-model="detailTab">
            <!-- Overview -->
            <v-window-item value="overview">
              <div class="sa-detail-grid mt-3">
                <div class="sa-detail-field"><span class="sa-detail-field__label">Schema</span><span class="sa-detail-field__value">{{ selected.schema_name }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Created By</span><span class="sa-detail-field__value">{{ selected.created_by_email || '—' }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Created</span><span class="sa-detail-field__value">{{ formatDate(selected.created_on) }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">MRR</span><span class="sa-detail-field__value">KSh {{ formatNum(selected.mrr_estimate) }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Currency</span><span class="sa-detail-field__value">{{ selected.currency_code }} ({{ selected.currency_symbol }})</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Timezone</span><span class="sa-detail-field__value">{{ selected.timezone }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Country</span><span class="sa-detail-field__value">{{ selected.country || '—' }}</span></div>
                <div class="sa-detail-field"><span class="sa-detail-field__label">Phone</span><span class="sa-detail-field__value">{{ selected.contact_phone || '—' }}</span></div>
              </div>

              <!-- Address -->
              <div class="sa-divider" />
              <p class="text-caption text-medium-emphasis mb-2">ADDRESS</p>
              <p class="text-body-2">{{ fullAddress(selected) || 'No address on file' }}</p>

              <!-- Branding -->
              <div class="sa-divider" />
              <p class="text-caption text-medium-emphasis mb-2">BRANDING</p>
              <div class="d-flex align-center ga-3">
                <div class="sa-brand-swatch" :style="{ background: selected.primary_color || '#1976D2' }" />
                <span class="text-body-2">{{ selected.primary_color || 'Default' }}</span>
                <v-img
                  v-if="selected.logo"
                  :src="selected.logo"
                  max-width="48"
                  max-height="48"
                  class="rounded-lg"
                  cover
                />
                <span v-else class="text-body-2 text-medium-emphasis">No logo</span>
              </div>

              <!-- Trial Info -->
              <template v-if="selected.on_trial">
                <div class="sa-divider" />
                <p class="text-caption text-medium-emphasis mb-2">TRIAL</p>
                <div class="sa-detail-grid">
                  <div class="sa-detail-field"><span class="sa-detail-field__label">Trial Ends</span><span class="sa-detail-field__value">{{ selected.trial_ends_at ? formatDate(selected.trial_ends_at) : '—' }}</span></div>
                  <div class="sa-detail-field"><span class="sa-detail-field__label">Days Left</span><span class="sa-detail-field__value" :class="trialDaysClass(selected)">{{ selected.days_to_trial_end }}d</span></div>
                </div>
              </template>

              <!-- Suspension Info -->
              <template v-if="selected.status === 'suspended'">
                <div class="sa-divider" />
                <p class="text-caption text-medium-emphasis mb-2">SUSPENSION</p>
                <div class="sa-detail-grid">
                  <div class="sa-detail-field"><span class="sa-detail-field__label">Reason</span><span class="sa-detail-field__value">{{ selected.suspended_reason || '—' }}</span></div>
                  <div class="sa-detail-field"><span class="sa-detail-field__label">Suspended At</span><span class="sa-detail-field__value">{{ selected.suspended_at ? formatTime(selected.suspended_at) : '—' }}</span></div>
                </div>
              </template>

              <!-- Notes -->
              <div class="sa-divider" />
              <p class="text-caption text-medium-emphasis mb-2">INTERNAL NOTES</p>
              <p class="text-body-2">{{ selected.notes || 'No internal notes' }}</p>
            </v-window-item>

            <!-- Manage -->
            <v-window-item value="manage">
              <div class="mt-3">
                <!-- Plan & Status Actions -->
                <p class="text-caption text-medium-emphasis mb-2">PLAN and STATUS</p>
                <div class="d-flex ga-2 flex-wrap mb-3">
                  <v-select v-model="manageForm.plan" :items="planValues" density="compact" variant="outlined" label="Plan" hide-details style="max-width:180px" />
                  <v-btn color="primary" variant="tonal" prepend-icon="mdi-swap-horizontal" :loading="actionLoading === selected.id" @click="changePlan">Change Plan</v-btn>
                </div>
                <div class="d-flex ga-2 flex-wrap mb-3">
                  <v-btn v-if="selected.status !== 'suspended'" size="small" variant="outlined" color="warning" prepend-icon="mdi-pause" :loading="actionLoading === selected.id" @click="suspendTenant(selected)">Suspend</v-btn>
                  <v-btn v-if="selected.status !== 'active'" size="small" variant="outlined" color="success" prepend-icon="mdi-play" :loading="actionLoading === selected.id" @click="activateTenant(selected)">Activate</v-btn>
                  <v-btn v-if="selected.status !== 'cancelled'" size="small" variant="outlined" color="error" prepend-icon="mdi-cancel" :loading="actionLoading === selected.id" @click="cancelTenant(selected)">Cancel</v-btn>
                </div>

                <!-- Resource Limits -->
                <p class="text-caption text-medium-emphasis mb-2 mt-4">RESOURCE LIMITS</p>
                <div class="sa-detail-grid">
                  <v-text-field v-model.number="manageForm.max_branches" type="number" density="compact" variant="outlined" label="Max Branches" hide-details />
                  <v-text-field v-model.number="manageForm.max_users" type="number" density="compact" variant="outlined" label="Max Users" hide-details />
                  <v-text-field v-model.number="manageForm.max_products" type="number" density="compact" variant="outlined" label="Max Products" hide-details />
                </div>
                <v-btn class="mt-3" color="primary" variant="tonal" prepend-icon="mdi-content-save" :loading="actionLoading === selected.id" @click="setLimits">Save Limits</v-btn>

                <!-- Trial Extension -->
                <p class="text-caption text-medium-emphasis mb-2 mt-5">TRIAL EXTENSION</p>
                <div class="d-flex ga-2 align-center flex-wrap">
                  <v-text-field v-model.number="manageForm.trial_days" type="number" density="compact" variant="outlined" label="Extend by (days)" hide-details style="max-width:140px" />
                  <v-btn color="info" variant="tonal" prepend-icon="mdi-calendar-clock" :loading="actionLoading === selected.id" @click="extendTrial">Extend Trial</v-btn>
                </div>

                <!-- Quick Edit Link -->
                <div class="sa-divider" />
                <p class="text-caption text-medium-emphasis mb-2">FULL PROFILE EDIT</p>
                <v-btn variant="outlined" prepend-icon="mdi-pencil-outline" @click="openEdit(selected)">Edit Contact, Address and Branding</v-btn>
              </div>
            </v-window-item>

            <!-- Domains -->
            <v-window-item value="domains">
              <div class="mt-3">
                <div class="d-flex align-center mb-3">
                  <p class="text-caption text-medium-emphasis flex-grow-1">DOMAINS ({{ selected.domains?.length || 0 }})</p>
                  <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-plus" @click="openDomainDialog(selected)">Add Domain</v-btn>
                </div>
                <v-alert v-if="!selected.domains?.length" type="info" variant="tonal" density="compact" class="mb-3">
                  No domains configured. Add one to make the tenant accessible.
                </v-alert>
                <v-list density="compact" lines="two" class="px-0">
                  <v-list-item v-for="d in selected.domains" :key="d.id">
                    <template #prepend>
                      <v-icon :color="d.is_primary ? 'primary' : 'grey'">{{ d.is_primary ? 'mdi-star' : 'mdi-web' }}</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">{{ d.domain }}</v-list-item-title>
                    <v-list-item-subtitle>{{ d.is_primary ? 'Primary domain' : 'Secondary' }}</v-list-item-subtitle>
                    <template #append>
                      <v-btn
                        v-if="!d.is_primary"
                        size="x-small" variant="text" color="primary"
                        :loading="actionLoading === selected.id"
                        @click="setPrimaryDomain(d)"
                      >Make Primary</v-btn>
                      <v-btn
                        size="x-small" variant="text" color="error"
                        icon="mdi-delete-outline"
                        :loading="actionLoading === selected.id"
                        @click="removeDomain(d)"
                      />
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-window-item>

            <!-- Users -->
            <v-window-item value="users">
              <div class="mt-3">
                <div class="d-flex align-center mb-3">
                  <p class="text-caption text-medium-emphasis flex-grow-1">USERS ({{ tenantUsers.length }})</p>
                  <v-btn size="small" color="primary" variant="tonal" prepend-icon="mdi-account-plus" @click="openCreateUser">Add User</v-btn>
                </div>

                <v-alert v-if="!tenantUsers.length && !loadingUsers" type="info" variant="tonal" density="compact" class="mb-3">
                  No users in this tenant.
                </v-alert>

                <v-list density="compact" lines="three" class="px-0">
                  <v-list-item v-for="u in tenantUsers" :key="u.id">
                    <template #prepend>
                      <div class="sa-user-avatar" :style="avatarStyle(u.full_name || u.email)">
                        {{ (u.first_name || u.email || '?').charAt(0).toUpperCase() }}
                      </div>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">
                      {{ u.full_name || u.email }}
                        <v-chip
                          v-if="!u.is_active"
                          size="x-small" variant="tonal" color="error" label class="ml-1"
                        >Inactive</v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ u.email }}</v-list-item-subtitle>
                    <v-list-item-subtitle>
                      <v-chip size="x-small" variant="tonal" :color="roleColor(u.role)" label>{{ u.role }}</v-chip>
                      <span v-if="u.phone" class="text-caption text-medium-emphasis ml-2">{{ u.phone }}</span>
                    </v-list-item-subtitle>
                    <template #append>
                      <div class="d-flex ga-1">
                        <v-btn
                          size="x-small" variant="text" icon="mdi-lock-reset"
                          color="warning"
                          :loading="userActionLoading === u.id"
                          @click="openPasswordDialog(u)"
                        />
                        <v-btn
                          size="x-small" variant="text" icon="mdi-pencil-outline"
                          @click="openEditUser(u)"
                        />
                        <v-btn
                          v-if="u.is_active"
                          size="x-small" variant="text" icon="mdi-account-off-outline"
                          color="error"
                          :loading="userActionLoading === u.id"
                          @click="toggleUserActive(u)"
                        />
                        <v-btn
                          v-else
                          size="x-small" variant="text" icon="mdi-account-check-outline"
                          color="success"
                          :loading="userActionLoading === u.id"
                          @click="toggleUserActive(u)"
                        />
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-window-item>

            <!-- Activity -->
            <v-window-item value="activity">
              <div class="mt-3">
                <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-refresh" :loading="loadingDrill" @click="loadActivity" class="mb-3">Load Activity</v-btn>
                <v-alert v-if="!activity.length && !loadingDrill" type="info" variant="tonal" density="compact">Click "Load Activity" to fetch this tenant's audit log.</v-alert>
                <v-timeline v-if="activity.length" density="compact" side="end">
                  <v-timeline-item v-for="(a, i) in activity" :key="i" size="x-small" :dot-color="activityColor(a.action)">
                    <div class="d-flex justify-space-between">
                      <span class="text-body-2 font-weight-medium">{{ a.action }}</span>
                      <span class="text-caption text-medium-emphasis">{{ formatTime(a.timestamp) }}</span>
                    </div>
                    <p class="text-caption text-medium-emphasis">{{ a.user_email || 'system' }}, {{ a.resource_type }}</p>
                  </v-timeline-item>
                </v-timeline>
              </div>
            </v-window-item>

            <!-- Billing -->
            <v-window-item value="billing">
              <div class="mt-3">
                <v-btn color="primary" variant="tonal" size="small" prepend-icon="mdi-refresh" :loading="loadingDrill" @click="loadBilling" class="mb-3">Load Billing</v-btn>
                <v-alert v-if="billing === null && !loadingDrill" type="info" variant="tonal" density="compact">Click "Load Billing" to fetch invoices and payments.</v-alert>
                <template v-if="billing">
                  <div class="d-flex ga-3 flex-wrap mb-4">
                    <v-chip color="success" variant="tonal" size="small">Paid: KSh {{ formatNum(billing.paid_total) }}</v-chip>
                    <v-chip color="primary" variant="tonal" size="small">{{ billing.invoices.length }} invoices</v-chip>
                    <v-chip color="info" variant="tonal" size="small">{{ billing.payments.length }} payments</v-chip>
                  </div>
                  <p class="text-caption text-medium-emphasis mb-1">INVOICES</p>
                  <v-list density="compact" lines="one" class="px-0">
                    <v-list-item v-for="inv in billing.invoices" :key="inv.id">
                      <v-list-item-title class="text-body-2">{{ inv.invoice_number }} — KSh {{ formatNum(inv.total) }}</v-list-item-title>
                      <v-list-item-subtitle>{{ inv.status }}, due {{ formatDate(inv.due_date) }}</v-list-item-subtitle>
                      <template #append><v-chip :color="invColor(inv.status)" size="x-small" variant="tonal" label>{{ inv.status }}</v-chip></template>
                    </v-list-item>
                  </v-list>
                </template>
              </div>
            </v-window-item>
          </v-window>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- ===== Create / Edit Dialog ===== -->
    <v-dialog v-model="editDialog" max-width="680" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">
          {{ editMode === 'create' ? 'Create New Tenant' : 'Edit: ' + (editForm.name || '') }}
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <!-- Business Info -->
          <p class="text-caption text-medium-emphasis mb-2">BUSINESS INFORMATION</p>
          <v-text-field v-model="editForm.name" label="Business Name" variant="outlined" density="compact" class="mb-3" />
          <div class="sa-detail-grid mb-3">
            <v-text-field v-model="editForm.contact_email" label="Contact Email" variant="outlined" density="compact" />
            <v-text-field v-model="editForm.contact_phone" label="Contact Phone" variant="outlined" density="compact" />
          </div>

          <!-- Address -->
          <p class="text-caption text-medium-emphasis mb-2">ADDRESS</p>
          <v-text-field v-model="editForm.address_line1" label="Address Line 1" variant="outlined" density="compact" class="mb-3" />
          <v-text-field v-model="editForm.address_line2" label="Address Line 2" variant="outlined" density="compact" class="mb-3" />
          <div class="sa-detail-grid mb-3">
            <v-text-field v-model="editForm.city" label="City" variant="outlined" density="compact" />
            <v-text-field v-model="editForm.state_province" label="State / Province" variant="outlined" density="compact" />
          </div>
          <div class="sa-detail-grid mb-3">
            <v-text-field v-model="editForm.postal_code" label="Postal Code" variant="outlined" density="compact" />
            <v-text-field v-model="editForm.country" label="Country" variant="outlined" density="compact" />
          </div>

          <!-- Plan and Locale -->
          <p class="text-caption text-medium-emphasis mb-2">PLAN and LOCALE</p>
          <div class="sa-detail-grid mb-3">
            <v-select v-model="editForm.plan" :items="planValues" label="Plan" variant="outlined" density="compact" />
            <v-select v-model="editForm.status" :items="statusValues" label="Status" variant="outlined" density="compact" />
          </div>
          <div class="sa-detail-grid mb-3">
            <v-select v-model="editForm.currency_code" :items="currencyOptions" item-title="label" item-value="code" label="Currency" variant="outlined" density="compact" />
            <v-text-field v-model="editForm.timezone" label="Timezone" variant="outlined" density="compact" />
          </div>

          <!-- Branding -->
          <p class="text-caption text-medium-emphasis mb-2">BRANDING</p>
          <div class="d-flex align-center ga-3 mb-3">
            <div class="sa-brand-swatch" :style="{ background: editForm.primary_color }" />
            <input v-model="editForm.primary_color" type="color" class="sa-color-picker" />
            <v-text-field v-model="editForm.primary_color" label="Primary Color (hex)" variant="outlined" density="compact" style="max-width:200px" hide-details />
          </div>

          <!-- Limits (create only) -->
          <template v-if="editMode === 'create'">
            <p class="text-caption text-medium-emphasis mb-2">RESOURCE LIMITS</p>
            <div class="sa-detail-grid mb-3">
              <v-text-field v-model.number="editForm.max_branches" type="number" label="Max Branches" variant="outlined" density="compact" />
              <v-text-field v-model.number="editForm.max_users" type="number" label="Max Users" variant="outlined" density="compact" />
              <v-text-field v-model.number="editForm.max_products" type="number" label="Max Products" variant="outlined" density="compact" />
            </div>
          </template>

          <!-- Notes -->
          <p class="text-caption text-medium-emphasis mb-2">INTERNAL NOTES</p>
          <v-textarea v-model="editForm.notes" label="Notes (visible to super-admins only)" variant="outlined" density="compact" rows="2" class="mb-1" />
        </v-card-text>
        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="savingEdit" @click="saveEdit">
            {{ editMode === 'create' ? 'Create Tenant' : 'Save Changes' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Add Domain Dialog ===== -->
    <v-dialog v-model="domainDialog" max-width="480">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">Add Domain</v-card-title>
        <v-card-text class="px-5 pb-2">
          <p v-if="domainTarget" class="text-body-2 text-medium-emphasis mb-3">
            Add a domain for <strong>{{ domainTarget.name }}</strong>
          </p>
          <v-text-field
            v-model="newDomain"
            label="Domain (e.g. acme.domendrapos.com)"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-switch v-model="newDomainPrimary" label="Set as primary domain" color="primary" density="compact" inset />
        </v-card-text>
        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="domainDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="actionLoading === (domainTarget?.id ?? null)" @click="addDomain">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Notes Dialog ===== -->
    <v-dialog v-model="notesDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">Edit Notes</v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-textarea
            v-model="notesForm.notes"
            label="Internal notes (super-admins only)"
            variant="outlined"
            density="compact"
            rows="4"
          />
        </v-card-text>
        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="notesDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="actionLoading === notesForm.id" @click="saveNotes">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Suspend Dialog ===== -->
    <v-dialog v-model="suspendDialog" max-width="440">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">Suspend Tenant</v-card-title>
        <v-card-text class="px-5 pb-2">
          <p v-if="suspendTarget" class="text-body-2 mb-3">
            Suspend <strong>{{ suspendTarget.name }}</strong>? Users on this tenant will lose access immediately.
          </p>
          <v-text-field v-model="suspendReason" label="Reason (optional)" variant="outlined" density="compact" />
        </v-card-text>
        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="suspendDialog = false">Cancel</v-btn>
          <v-btn color="warning" :loading="actionLoading === (suspendTarget?.id ?? null)" @click="confirmSuspend">Suspend</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Create / Edit User Dialog ===== -->
    <v-dialog v-model="userDialog" max-width="520" persistent>
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">
          {{ userEditMode === 'create' ? 'Add User' : 'Edit User' }}
          <span v-if="selected" class="text-body-2 text-medium-emphasis ml-2">in {{ selected.name }}</span>
        </v-card-title>
        <v-card-text class="px-5 pb-2">
          <v-text-field v-model="userForm.email" label="Email" variant="outlined" density="compact" class="mb-3" />
          <div class="sa-detail-grid mb-3">
            <v-text-field v-model="userForm.first_name" label="First Name" variant="outlined" density="compact" />
            <v-text-field v-model="userForm.last_name" label="Last Name" variant="outlined" density="compact" />
          </div>
          <v-select v-model="userForm.role" :items="roleOptions" label="Role" variant="outlined" density="compact" class="mb-3" />
          <v-text-field v-model="userForm.phone" label="Phone" variant="outlined" density="compact" class="mb-3" />
          <v-text-field v-if="userEditMode === 'create'" v-model="userForm.password" label="Password (min 8 chars)" type="password" variant="outlined" density="compact" class="mb-1" />
        </v-card-text>
        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="userDialog = false">Cancel</v-btn>
          <v-btn color="primary" :loading="savingUser" @click="saveUser">
            {{ userEditMode === 'create' ? 'Create User' : 'Save Changes' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ===== Password Reset Dialog ===== -->
    <v-dialog v-model="passwordDialog" max-width="460">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-5 pb-2">Reset Password</v-card-title>
        <v-card-text class="px-5 pb-2">
          <p v-if="passwordTarget" class="text-body-2 mb-3">
            Reset password for <strong>{{ passwordTarget.email }}</strong>
          </p>
          <v-text-field
            v-model="newPassword"
            label="New Password (min 8 chars)"
            type="password"
            variant="outlined"
            density="compact"
            class="mb-3"
          />
          <v-text-field
            v-model="confirmPassword"
            label="Confirm Password"
            type="password"
            variant="outlined"
            density="compact"
            class="mb-1"
            :error-messages="passwordMismatch"
          />
        </v-card-text>
        <v-card-actions class="pa-5 pt-2">
          <v-spacer />
          <v-btn variant="text" @click="passwordDialog = false">Cancel</v-btn>
          <v-btn color="warning" :loading="userActionLoading === (passwordTarget?.id ?? null)" @click="confirmPasswordReset">Reset Password</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const toast = useToast()

interface Tenant {
  id: number
  name: string
  schema_name: string
  plan: string
  status: string
  logo: string | null
  primary_color: string
  contact_email: string
  contact_phone: string
  address_line1: string
  address_line2: string
  city: string
  state_province: string
  postal_code: string
  country: string
  currency_code: string
  currency_symbol: string
  timezone: string
  on_trial: boolean
  trial_ends_at: string | null
  paid_until: string | null
  max_branches: number
  max_users: number
  max_products: number
  suspended_reason: string
  suspended_at: string | null
  last_activated_at: string | null
  notes: string
  created_on: string
  created_by_email: string
  days_to_trial_end: number | null
  is_trial_expired: boolean
  mrr_estimate: number
  domains: { id: number; domain: string; is_primary: boolean }[]
}

const loading = ref(false)
const savingEdit = ref(false)
const bulkLoading = ref(false)
const tenants = ref<Tenant[]>([])
const search = ref('')
const statusFilter = ref('all')
const planFilter = ref('all')
const actionLoading = ref<number | null>(null)
const selectedIds = ref<Tenant[]>([])

// stats
const stats = ref<any>({})

const statusOptions = [
  { title: 'All Status', value: 'all' },
  { title: 'Active', value: 'active' },
  { title: 'Trial', value: 'trial' },
  { title: 'Suspended', value: 'suspended' },
  { title: 'Cancelled', value: 'cancelled' },
]
const planOptions = [
  { title: 'All Plans', value: 'all' },
  { title: 'Free', value: 'free' },
  { title: 'Starter', value: 'starter' },
  { title: 'Business', value: 'business' },
  { title: 'Enterprise', value: 'enterprise' },
]
const planValues = ['free', 'starter', 'business', 'enterprise']
const statusValues = ['trial', 'active', 'suspended', 'cancelled']

const currencyOptions = [
  { code: 'KES', label: 'KSh — Kenyan Shilling' },
  { code: 'USD', label: '$ — US Dollar' },
  { code: 'EUR', label: '€ — Euro' },
  { code: 'GBP', label: '£ — British Pound' },
  { code: 'UGX', label: 'USh — Ugandan Shilling' },
  { code: 'TZS', label: 'TSh — Tanzanian Shilling' },
  { code: 'NGN', label: '₦ — Nigerian Naira' },
  { code: 'INR', label: '₹ — Indian Rupee' },
  { code: 'CAD', label: 'C$ — Canadian Dollar' },
  { code: 'AUD', label: 'A$ — Australian Dollar' },
  { code: 'ZAR', label: 'R — South African Rand' },
  { code: 'GHS', label: '₵ — Ghanaian Cedi' },
]

const headers = [
  { title: 'Tenant', key: 'name', sortable: true },
  { title: 'Plan', key: 'plan', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Limits', key: 'limits', sortable: false },
  { title: 'Trial', key: 'trial', sortable: false },
  { title: 'MRR', key: 'mrr_estimate', sortable: true },
  { title: 'Created', key: 'created_on', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

const filteredTenants = computed(() => {
  let list = tenants.value
  if (statusFilter.value !== 'all') list = list.filter(t => t.status === statusFilter.value)
  if (planFilter.value !== 'all') list = list.filter(t => t.plan === planFilter.value)
  if (search.value) {
    const q = search.value.toLowerCase()
    list = list.filter(t =>
      t.name?.toLowerCase().includes(q) ||
      t.contact_email?.toLowerCase().includes(q) ||
      t.schema_name?.toLowerCase().includes(q),
    )
  }
  return list
})

// computed stats
function countByStatus(s: string): number {
  return tenants.value.filter(t => t.status === s).length
}
const activePct = computed(() => {
  const total = tenants.value.length
  return total ? Math.round((countByStatus('active') / total) * 100) : 0
})
const totalMRR = computed(() => tenants.value.reduce((sum, t) => sum + (t.mrr_estimate || 0), 0))
const trialExpiringCount = computed(() =>
  tenants.value.filter(t => t.on_trial && (t.days_to_trial_end ?? 0) <= 3 && (t.days_to_trial_end ?? 0) >= 0).length,
)

// Detail drawer
const drawerOpen = ref(false)
const selected = ref<Tenant | null>(null)
const detailTab = ref('overview')
const manageForm = reactive({
  plan: 'free',
  max_branches: 1,
  max_users: 5,
  max_products: 500,
  trial_days: 7,
})
const loadingDrill = ref(false)
const activity = ref<any[]>([])
const billing = ref<any | null>(null)

// Users tab
const tenantUsers = ref<any[]>([])
const loadingUsers = ref(false)
const userActionLoading = ref<number | null>(null)
const savingUser = ref(false)
const userDialog = ref(false)
const userEditMode = ref<'create' | 'edit'>('create')
const userForm = reactive({
  email: '',
  first_name: '',
  last_name: '',
  role: 'viewer',
  phone: '',
  password: '',
  _id: null as number | null,
})
const passwordDialog = ref(false)
const passwordTarget = ref<any | null>(null)
const newPassword = ref('')
const confirmPassword = ref('')

const roleOptions = [
  { title: 'Tenant Admin', value: 'tenant_admin' },
  { title: 'Manager', value: 'manager' },
  { title: 'Cashier', value: 'cashier' },
  { title: 'Inventory Clerk', value: 'inventory_clerk' },
  { title: 'Accountant', value: 'accountant' },
  { title: 'Sales Associate', value: 'sales_associate' },
  { title: 'Viewer', value: 'viewer' },
]

const passwordMismatch = computed(() => {
  if (!confirmPassword.value) return ''
  if (newPassword.value !== confirmPassword.value) return 'Passwords do not match'
  return ''
})

function roleColor(role: string): string {
  const map: Record<string, string> = {
    tenant_admin: 'primary',
    manager: 'info',
    cashier: 'success',
    inventory_clerk: 'warning',
    accountant: 'purple',
    sales_associate: 'teal',
    viewer: 'grey',
  }
  return map[role] || 'grey'
}

function openDetail(t: Tenant) {
  selected.value = t
  if (selected.value) {
    manageForm.plan = selected.value.plan
    manageForm.max_branches = selected.value.max_branches
    manageForm.max_users = selected.value.max_users
    manageForm.max_products = selected.value.max_products
    manageForm.trial_days = 7
  }
  activity.value = []
  billing.value = null
  tenantUsers.value = []
  loadingUsers.value = false
  detailTab.value = 'overview'
  drawerOpen.value = true
  // Auto-load users
  loadUsers()
}

// Create / Edit dialog
const editDialog = ref(false)
const editMode = ref<'create' | 'edit'>('create')
const editForm = reactive({
  name: '',
  contact_email: '',
  contact_phone: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state_province: '',
  postal_code: '',
  country: 'United States',
  plan: 'free',
  status: 'trial',
  currency_code: 'KES',
  timezone: 'Africa/Nairobi',
  primary_color: '#1976D2',
  max_branches: 1,
  max_users: 5,
  max_products: 500,
  notes: '',
  _id: null as number | null,
})

function openCreate() {
  editMode.value = 'create'
  Object.assign(editForm, {
    name: '', contact_email: '', contact_phone: '',
    address_line1: '', address_line2: '', city: '', state_province: '', postal_code: '',
    country: 'United States', plan: 'free', status: 'trial',
    currency_code: 'KES', timezone: 'Africa/Nairobi', primary_color: '#1976D2',
    max_branches: 1, max_users: 5, max_products: 500, notes: '', _id: null,
  })
  editDialog.value = true
}

function openEdit(t: Tenant) {
  editMode.value = 'edit'
  Object.assign(editForm, {
    name: t.name || '',
    contact_email: t.contact_email || '',
    contact_phone: t.contact_phone || '',
    address_line1: t.address_line1 || '',
    address_line2: t.address_line2 || '',
    city: t.city || '',
    state_province: t.state_province || '',
    postal_code: t.postal_code || '',
    country: t.country || 'United States',
    plan: t.plan || 'free',
    status: t.status || 'trial',
    currency_code: t.currency_code || 'KES',
    timezone: t.timezone || 'Africa/Nairobi',
    primary_color: t.primary_color || '#1976D2',
    max_branches: t.max_branches,
    max_users: t.max_users,
    max_products: t.max_products,
    notes: t.notes || '',
    _id: t.id,
  })
  editDialog.value = true
}

async function saveEdit() {
  if (!editForm.name || !editForm.contact_email) {
    toast.error('Name and contact email are required')
    return
  }
  savingEdit.value = true
  try {
    const body = {
      name: editForm.name,
      contact_email: editForm.contact_email,
      contact_phone: editForm.contact_phone,
      address_line1: editForm.address_line1,
      address_line2: editForm.address_line2,
      city: editForm.city,
      state_province: editForm.state_province,
      postal_code: editForm.postal_code,
      country: editForm.country,
      plan: editForm.plan,
      status: editForm.status,
      currency_code: editForm.currency_code,
      timezone: editForm.timezone,
      primary_color: editForm.primary_color,
      max_branches: editForm.max_branches,
      max_users: editForm.max_users,
      max_products: editForm.max_products,
      notes: editForm.notes,
    }
    if (editMode.value === 'create') {
      await useApi()('/tenants/manage/', { method: 'POST', body })
      toast.success('Tenant created')
    } else {
      await useApi()('/tenants/manage/' + editForm._id + '/', { method: 'PATCH', body })
      toast.success('Tenant updated')
    }
    editDialog.value = false
    await loadTenants()
    if (selected.value && editForm._id === selected.value.id) await refreshSelected()
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Failed to save tenant')
  } finally {
    savingEdit.value = false
  }
}

// Domain dialog
const domainDialog = ref(false)
const domainTarget = ref<Tenant | null>(null)
const newDomain = ref('')
const newDomainPrimary = ref(false)

function openDomainDialog(t: Tenant) {
  domainTarget.value = t
  newDomain.value = ''
  newDomainPrimary.value = false
  domainDialog.value = true
}

async function addDomain() {
  if (!domainTarget.value || !newDomain.value) return
  try {
    const res = await apiAction(domainTarget.value.id, 'domains/add', {
      domain: newDomain.value.trim().toLowerCase(),
      is_primary: newDomainPrimary.value,
    })
    if (selected.value && domainTarget.value.id === selected.value.id) {
      selected.value.domains = res
    }
    toast.success('Domain added')
    domainDialog.value = false
    await loadTenants()
  } catch { /* error toast from apiAction */ }
}

async function removeDomain(d: any) {
  if (!selected.value) return
  try {
    const res = await useApi()('/tenants/manage/' + selected.value.id + '/domains/' + d.id + '/remove/', { method: 'POST' })
    selected.value.domains = res
    toast.success('Domain removed')
    await loadTenants()
  } catch {
    toast.error('Failed to remove domain')
  }
}

async function setPrimaryDomain(d: any) {
  if (!selected.value) return
  try {
    await useApi()('/tenants/manage/' + selected.value.id + '/domains/' + d.id + '/remove/', { method: 'POST' })
    const res = await apiAction(selected.value.id, 'domains/add', { domain: d.domain, is_primary: true })
    selected.value.domains = res
    toast.success('Primary domain updated')
    await loadTenants()
  } catch {
    toast.error('Failed to update primary domain')
  }
}

// Notes dialog
const notesDialog = ref(false)
const notesForm = reactive({ id: 0, notes: '' })

function openNotesDialog(t: Tenant) {
  notesForm.id = t.id
  notesForm.notes = t.notes || ''
  notesDialog.value = true
}

async function saveNotes() {
  try {
    await useApi()('/tenants/manage/' + notesForm.id + '/', { method: 'PATCH', body: { notes: notesForm.notes } })
    toast.success('Notes updated')
    notesDialog.value = false
    await loadTenants()
    if (selected.value && notesForm.id === selected.value.id) {
      selected.value.notes = notesForm.notes
    }
  } catch {
    toast.error('Failed to save notes')
  }
}

// Suspend dialog
const suspendDialog = ref(false)
const suspendTarget = ref<Tenant | null>(null)
const suspendReason = ref('')

function suspendTenant(t: Tenant) {
  suspendTarget.value = t
  suspendReason.value = ''
  suspendDialog.value = true
}

async function confirmSuspend() {
  if (!suspendTarget.value) return
  try {
    await apiAction(suspendTarget.value.id, 'suspend', { reason: suspendReason.value || 'Suspended by platform admin' })
    toast.success(suspendTarget.value.name + ' suspended')
    suspendDialog.value = false
    await refreshSelected()
    await loadTenants()
  } catch {
    toast.error('Failed to suspend tenant')
  }
}

// Actions
async function activateTenant(t: Tenant) {
  try {
    await apiAction(t.id, 'activate')
    toast.success(t.name + ' activated')
    await refreshSelected()
    await loadTenants()
  } catch {
    toast.error('Failed to activate tenant')
  }
}

async function cancelTenant(t: Tenant) {
  if (!confirm('Cancel tenant "' + t.name + '"? This cannot be undone.')) return
  try {
    await apiAction(t.id, 'cancel')
    toast.success(t.name + ' cancelled')
    await refreshSelected()
    await loadTenants()
  } catch {
    toast.error('Failed to cancel tenant')
  }
}

async function changePlan() {
  if (!selected.value) return
  try {
    await apiAction(selected.value.id, 'change_plan', { plan: manageForm.plan })
    toast.success('Plan changed to ' + manageForm.plan)
    await refreshSelected()
    await loadTenants()
  } catch {
    toast.error('Failed to change plan')
  }
}

async function setLimits() {
  if (!selected.value) return
  try {
    await apiAction(selected.value.id, 'set-limits', {
      max_branches: manageForm.max_branches,
      max_users: manageForm.max_users,
      max_products: manageForm.max_products,
    })
    toast.success('Limits updated')
    await refreshSelected()
    await loadTenants()
  } catch {
    toast.error('Failed to set limits')
  }
}

async function extendTrial() {
  if (!selected.value) return
  try {
    await apiAction(selected.value.id, 'extend-trial', { days: manageForm.trial_days })
    toast.success('Trial extended by ' + manageForm.trial_days + ' days')
    await refreshSelected()
    await loadTenants()
  } catch {
    toast.error('Failed to extend trial')
  }
}

// Bulk actions
async function bulkAction(action: string) {
  if (!selectedIds.value.length) return
  bulkLoading.value = true
  let ok = 0
  let fail = 0
  for (const t of selectedIds.value) {
    try {
      await apiAction(t.id, action)
      ok++
    } catch {
      fail++
    }
  }
  bulkLoading.value = false
  selectedIds.value = []
  if (ok) toast.success(ok + ' tenant(s) ' + action + 'd')
  if (fail) toast.error(fail + ' failed')
  await loadTenants()
}

// Drill-down loaders
async function loadActivity() {
  if (!selected.value) return
  loadingDrill.value = true
  try {
    const res = await useApi()('/tenants/manage/' + selected.value.id + '/activity/')
    activity.value = res.results || res.logs || res || []
  } catch {
    toast.error('Failed to load activity')
  } finally {
    loadingDrill.value = false
  }
}

async function loadBilling() {
  if (!selected.value) return
  loadingDrill.value = true
  try {
    billing.value = await useApi()('/tenants/manage/' + selected.value.id + '/billing/')
  } catch {
    toast.error('Failed to load billing')
  } finally {
    loadingDrill.value = false
  }
}

// ── Tenant Users ──
async function loadUsers() {
  if (!selected.value) return
  loadingUsers.value = true
  try {
    const res = await useApi()('/tenants/manage/' + selected.value.id + '/users/')
    tenantUsers.value = res.results || []
  } catch {
    toast.error('Failed to load users')
  } finally {
    loadingUsers.value = false
  }
}

function openCreateUser() {
  userEditMode.value = 'create'
  Object.assign(userForm, {
    email: '', first_name: '', last_name: '', role: 'viewer',
    phone: '', password: '', _id: null,
  })
  userDialog.value = true
}

function openEditUser(u: any) {
  userEditMode.value = 'edit'
  Object.assign(userForm, {
    email: u.email || '',
    first_name: u.first_name || '',
    last_name: u.last_name || '',
    role: u.role || 'viewer',
    phone: u.phone || '',
    password: '',
    _id: u.id,
  })
  userDialog.value = true
}

async function saveUser() {
  if (!selected.value) return
  if (!userForm.email) {
    toast.error('Email is required')
    return
  }
  if (userEditMode.value === 'create' && (!userForm.password || userForm.password.length < 8)) {
    toast.error('Password must be at least 8 characters')
    return
  }
  savingUser.value = true
  try {
    if (userEditMode.value === 'create') {
      await useApi()('/tenants/manage/' + selected.value.id + '/users/', {
        method: 'POST',
        body: {
          email: userForm.email,
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          role: userForm.role,
          phone: userForm.phone,
          password: userForm.password,
        },
      })
      toast.success('User created')
    } else {
      await useApi()('/tenants/manage/' + selected.value.id + '/users/' + userForm._id + '/update/', {
        method: 'PATCH',
        body: {
          first_name: userForm.first_name,
          last_name: userForm.last_name,
          role: userForm.role,
          phone: userForm.phone,
        },
      })
      toast.success('User updated')
    }
    userDialog.value = false
    await loadUsers()
  } catch (e: any) {
    toast.error(e?.data?.detail || 'Failed to save user')
  } finally {
    savingUser.value = false
  }
}

function openPasswordDialog(u: any) {
  passwordTarget.value = u
  newPassword.value = ''
  confirmPassword.value = ''
  passwordDialog.value = true
}

async function confirmPasswordReset() {
  if (!selected.value || !passwordTarget.value) return
  if (!newPassword.value || newPassword.value.length < 8) {
    toast.error('Password must be at least 8 characters')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    toast.error('Passwords do not match')
    return
  }
  userActionLoading.value = passwordTarget.value.id
  try {
    await useApi()('/tenants/manage/' + selected.value.id + '/users/' + passwordTarget.value.id + '/reset-password/', {
      method: 'POST',
      body: { new_password: newPassword.value },
    })
    toast.success('Password reset for ' + passwordTarget.value.email)
    passwordDialog.value = false
  } catch {
    toast.error('Failed to reset password')
  } finally {
    userActionLoading.value = null
  }
}

async function toggleUserActive(u: any) {
  if (!selected.value) return
  userActionLoading.value = u.id
  try {
    await useApi()('/tenants/manage/' + selected.value.id + '/users/' + u.id + '/toggle-active/', {
      method: 'POST',
    })
    toast.success(u.is_active ? 'User deactivated' : 'User activated')
    await loadUsers()
  } catch {
    toast.error('Failed to toggle user status')
  } finally {
    userActionLoading.value = null
  }
}

// Helpers
async function apiAction(id: number, action: string, body?: any) {
  actionLoading.value = id
  try {
    return await useApi()('/tenants/manage/' + id + '/' + action + '/', { method: 'POST', body })
  } finally {
    actionLoading.value = null
  }
}

async function refreshSelected() {
  if (!selected.value) return
  try {
    const updated = await useApi()('/tenants/manage/' + selected.value.id + '/')
    Object.assign(selected.value, updated)
  } catch { /* keep stale */ }
}

function planColor(plan: string): string {
  const map: Record<string, string> = { free: 'grey', starter: 'primary', business: 'purple', enterprise: 'amber' }
  return map[plan] || 'grey'
}
function statusColor(status: string): string {
  const map: Record<string, string> = { trial: 'info', active: 'success', suspended: 'warning', cancelled: 'error' }
  return map[status] || 'grey'
}
function activityColor(action: string): string {
  if (action?.includes('create')) return 'success'
  if (action?.includes('delete')) return 'error'
  if (action?.includes('update')) return 'warning'
  return 'primary'
}
function invColor(s: string): string {
  const m: Record<string, string> = { paid: 'success', overdue: 'error', sent: 'info', draft: 'grey', cancelled: 'grey' }
  return m[s] || 'grey'
}
function avatarStyle(name: string): Record<string, string> {
  const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4', '#f43f5e']
  const idx = (name?.charCodeAt(0) || 0) % colors.length
  const c = colors[idx]
  return { background: c + '22', color: c }
}

function trialColor(t: Tenant): string {
  const days = t.days_to_trial_end ?? 0
  if (days <= 3) return 'error'
  if (days <= 7) return 'warning'
  return 'info'
}
function trialIcon(t: Tenant): string {
  const days = t.days_to_trial_end ?? 0
  if (days <= 3) return 'mdi-alert-circle-outline'
  return 'mdi-clock-outline'
}
function trialDaysClass(t: Tenant): string {
  const days = t.days_to_trial_end ?? 0
  if (days <= 3) return 'text-error'
  return ''
}

function fullAddress(t: Tenant): string {
  const parts = [t.address_line1, t.address_line2, t.city, t.state_province, t.postal_code, t.country].filter(Boolean)
  return parts.join(', ')
}

function formatDate(v: string): string {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatTime(v: string): string {
  if (!v) return '—'
  return new Date(v).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function formatNum(v: number): string {
  return Number(v || 0).toLocaleString('en-US')
}

// Load
async function loadStats() {
  try {
    stats.value = await useApi()('/tenants/manage/stats/')
  } catch { /* non-fatal */ }
}

async function loadTenants() {
  loading.value = true
  try {
    const data = await useApi()('/tenants/manage/')
    tenants.value = data.results || data
    await loadStats()
  } catch {
    toast.error('Failed to load tenants')
  } finally {
    loading.value = false
  }
}

onMounted(loadTenants)
</script>

<style scoped>
.sa-drawer :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.sa-drawer__header {
  padding: 20px 20px 12px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  position: sticky;
  top: 0;
  background: rgb(var(--v-theme-surface));
  z-index: 1;
}
.sa-drawer__body {
  padding: 8px 20px 40px;
  flex: 1;
  overflow-y: auto;
}

.sa-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sa-status-dot--active { background: rgb(var(--v-theme-success)); }
.sa-status-dot--trial { background: rgb(var(--v-theme-info)); }
.sa-status-dot--suspended { background: rgb(var(--v-theme-warning)); }
.sa-status-dot--cancelled { background: rgb(var(--v-theme-error)); }

.sa-bulk-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(var(--v-theme-primary), 0.06);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.sa-brand-swatch {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.sa-color-picker {
  width: 40px;
  height: 40px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
  cursor: pointer;
  background: transparent;
  padding: 2px;
}

.sa-user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}
</style>
