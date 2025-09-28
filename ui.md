# BorneoTrace - UI/UX Design Documentation

**Version:** 1.0  
**Date:** January 2025  
**Project:** Halal & Sustainable Certification Tracking System on MasChain

---

## 1. Design System Overview

### 1.1 Design Principles

- **Transparency First**: Clear, honest communication of product information
- **Trust Building**: Visual elements that reinforce credibility and authenticity
- **Accessibility**: Inclusive design for users of all abilities and technical backgrounds
- **Sustainability**: Green and eco-friendly visual themes reflecting environmental consciousness
- **Cultural Sensitivity**: Respectful representation of Malaysian and Islamic cultural elements

### 1.2 Color Palette

#### Primary Colors
- **Green Primary**: `#2e7d32` - Represents sustainability, nature, and growth
- **Green Light**: `#4caf50` - Secondary green for accents and highlights
- **Green Dark**: `#1b5e20` - Dark green for text and emphasis

#### Secondary Colors
- **Blue Primary**: `#1976d2` - Trust, reliability, and technology
- **Blue Light**: `#42a5f5` - Light blue for backgrounds and subtle elements
- **Blue Dark**: `#0d47a1` - Dark blue for contrast and depth

#### Neutral Colors
- **White**: `#ffffff` - Clean backgrounds and cards
- **Light Gray**: `#f5f5f5` - Subtle backgrounds and dividers
- **Medium Gray**: `#9e9e9e` - Secondary text and icons
- **Dark Gray**: `#424242` - Primary text and emphasis
- **Black**: `#000000` - High contrast text and borders

#### Status Colors
- **Success**: `#4caf50` - Successful operations and valid certificates
- **Warning**: `#ff9800` - Pending verifications and warnings
- **Error**: `#f44336` - Errors and invalid certificates
- **Info**: `#2196f3` - Information and neutral states

### 1.3 Typography

#### Font Family
- **Primary**: Inter (Google Fonts) - Modern, readable, and professional
- **Secondary**: Roboto - Material Design standard
- **Monospace**: 'Courier New', monospace - For blockchain addresses and IDs

#### Font Sizes and Hierarchy
```css
h1: 2.125rem (34px) - Page titles
h2: 1.5rem (24px) - Section headers
h3: 1.25rem (20px) - Subsection headers
h4: 1.125rem (18px) - Card titles
h5: 1rem (16px) - Small headers
h6: 0.875rem (14px) - Labels and captions
body1: 1rem (16px) - Body text
body2: 0.875rem (14px) - Secondary text
caption: 0.75rem (12px) - Small text and metadata
```

#### Font Weights
- **Light**: 300 - Subtle text and labels
- **Regular**: 400 - Body text and standard content
- **Medium**: 500 - Emphasis and secondary headers
- **Bold**: 700 - Primary headers and important information

### 1.4 Spacing System

#### Base Unit: 8px
- **xs**: 4px (0.5 units)
- **sm**: 8px (1 unit)
- **md**: 16px (2 units)
- **lg**: 24px (3 units)
- **xl**: 32px (4 units)
- **xxl**: 48px (6 units)
- **xxxl**: 64px (8 units)

#### Component Spacing
- **Card Padding**: 24px (3 units)
- **Section Margins**: 32px (4 units)
- **Button Padding**: 12px horizontal, 8px vertical
- **Form Field Spacing**: 16px between fields

## 2. Component Design Specifications

### 2.1 Navigation Components

#### 2.1.1 Main Navigation Bar
```typescript
interface NavBarProps {
  user: User | null;
  onWalletConnect: () => void;
  onWalletDisconnect: () => void;
}
```

**Design Specifications:**
- **Height**: 64px
- **Background**: White with subtle shadow
- **Logo**: Left-aligned BorneoTrace logo
- **Navigation**: Center-aligned role-based menu items
- **Wallet**: Right-aligned wallet connection button
- **Responsive**: Collapsible menu on mobile devices

#### 2.1.2 Role-Based Navigation
- **Certifier**: Dashboard, Issue Certificates, Manage Certificates
- **Producer**: Dashboard, Create Batches, Manage Batches, Transfer Batches
- **Verifier**: Dashboard, Pending Verifications, Verification History
- **Consumer**: Scan QR Code, Verify Product

### 2.2 Card Components

#### 2.2.1 Certificate Card
```typescript
interface CertificateCardProps {
  certificate: Certificate;
  showActions?: boolean;
  onRevoke?: (certificateId: number) => void;
}
```

**Visual Design:**
- **Layout**: Vertical card with header, content, and actions
- **Header**: Certificate type badge, status indicator, expiry date
- **Content**: Certificate details, issuer information, validity status
- **Actions**: Revoke button (if authorized)
- **Status Indicators**: Color-coded status badges
- **Hover Effects**: Subtle elevation increase on hover

#### 2.2.2 Batch Card
```typescript
interface BatchCardProps {
  batch: Batch;
  showActions?: boolean;
  onTransfer?: (batchId: number) => void;
  onCancel?: (batchId: number) => void;
}
```

**Visual Design:**
- **Layout**: Horizontal card with product info and status
- **Header**: Batch ID, product type, quantity
- **Content**: Origin information, linked certificates, current status
- **Actions**: Transfer, Cancel buttons (if authorized)
- **Progress Indicator**: Visual status progression
- **Certificate Links**: Expandable certificate details

### 2.3 Form Components

#### 2.3.1 Certificate Minting Form
**Fields:**
- Certificate ID (text input)
- Certificate Type (dropdown: Halal, MSPO, Organic, Fair Trade)
- Certified Entity Address (address input with validation)
- Validity Period (date picker or number input)
- Metadata URI (text input with IPFS integration)
- Document Upload (file upload with preview)

**Validation:**
- Real-time validation feedback
- Error messages with specific guidance
- Success indicators for completed fields

#### 2.3.2 Batch Creation Form
**Fields:**
- Batch ID (text input)
- Product Type (text input with suggestions)
- Quantity (number input with unit selector)
- Harvest Date (date picker)
- Origin Information (textarea)
- Linked Certificates (multi-select with search)
- Metadata URI (text input)

**UX Features:**
- Auto-save draft functionality
- Certificate validation in real-time
- Form progress indicator

### 2.4 QR Code Components

#### 2.4.1 QR Scanner
```typescript
interface QRScannerProps {
  onScan: (data: string) => void;
  onError: (error: string) => void;
  active: boolean;
}
```

**Visual Design:**
- **Camera View**: Full-screen camera interface
- **Overlay**: Rounded rectangle overlay for scanning area
- **Instructions**: Clear scanning instructions
- **Status**: Real-time scanning status feedback
- **Controls**: Manual input option, flashlight toggle

#### 2.4.2 QR Code Display
```typescript
interface QRCodeDisplayProps {
  batchId: number;
  size?: number;
  includeUrl?: boolean;
}
```

**Visual Design:**
- **QR Code**: High-contrast black and white
- **Batch Info**: Batch ID and verification URL
- **Download Option**: Save QR code as image
- **Print Option**: Print-friendly format

## 3. Page Layouts and Wireframes

### 3.1 Home Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Navigation Bar                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    BorneoTrace Logo                         │
│              Halal & Sustainable Certification             │
│                        Tracking System                     │
│                                                             │
│              [Connect Wallet to Get Started]               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Certifiers  │  │ Producers   │  │ Consumers   │        │
│  │             │  │             │  │             │        │
│  │ Issue and   │  │ Create and  │  │ Verify      │        │
│  │ manage      │  │ manage      │  │ product     │        │
│  │ certificates│  │ batches     │  │ authenticity│        │
│  │             │  │             │  │             │        │
│  │[Dashboard]  │  │[Dashboard]  │  │[Scan QR]    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    About BorneoTrace                       │
│                                                             │
│  BorneoTrace is a blockchain-based platform leveraging     │
│  MasChain to track the provenance and certification        │
│  status of products, particularly focusing on agricultural │
│  and food & beverage industries relevant to Sabah and      │
│  Malaysia...                                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Dashboard Layouts

#### 3.2.1 Certifier Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                    Navigation Bar                           │
├─────────────────────────────────────────────────────────────┤
│  Certifier Dashboard                    [Issue Certificate] │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Statistics                           ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   ││
│  │  │ Total   │  │ Active  │  │ Expired │  │ Revoked │   ││
│  │  │ Certs   │  │ Certs   │  │ Certs   │  │ Certs   │   ││
│  │  │   45    │  │   38    │  │    5    │  │    2    │   ││
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                Recent Certificates                     ││
│  │                                                         ││
│  │  [Certificate Card 1]                                  ││
│  │  [Certificate Card 2]                                  ││
│  │  [Certificate Card 3]                                  ││
│  │                                                         ││
│  │                    [View All]                          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### 3.2.2 Producer Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│                    Navigation Bar                           │
├─────────────────────────────────────────────────────────────┤
│  Producer Dashboard                     [Create Batch]      │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Statistics                           ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   ││
│  │  │ Total   │  │ Pending │  │ Active  │  │ In      │   ││
│  │  │ Batches │  │ Verify  │  │ Batches │  │ Transit │   ││
│  │  │   23    │  │    3    │  │   15    │  │    5    │   ││
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘   ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Recent Batches                        ││
│  │                                                         ││
│  │  [Batch Card 1]                                        ││
│  │  [Batch Card 2]                                        ││
│  │  [Batch Card 3]                                        ││
│  │                                                         ││
│  │                    [View All]                          ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Scanning and Verification Pages

#### 3.3.1 QR Scan Page
```
┌─────────────────────────────────────────────────────────────┐
│                    Navigation Bar                           │
├─────────────────────────────────────────────────────────────┤
│  Verify Product                                             │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    [Scan QR Code]                      ││
│  │                    [Enter Batch ID]                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                                                         ││
│  │                   Camera View                           ││
│  │                                                         ││
│  │              ┌─────────────────┐                        ││
│  │              │                 │                        ││
│  │              │   Scan Area     │                        ││
│  │              │                 │                        ││
│  │              └─────────────────┘                        ││
│  │                                                         ││
│  │            Position QR code within frame                ││
│  │                                                         ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### 3.3.2 Verification Results Page
```
┌─────────────────────────────────────────────────────────────┐
│                    Navigation Bar                           │
├─────────────────────────────────────────────────────────────┤
│  Product Verification Results                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  ✅ Product verification successful!                    ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                Batch Information                        ││
│  │                                                         ││
│  │  Batch ID: #12345                                       ││
│  │  Product: Organic Palm Oil                              ││
│  │  Quantity: 1000 L                                       ││
│  │  Origin: Tawau, Sabah                                   ││
│  │  Status: Active                                         ││
│  │  Current Owner: ABC Logistics                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Linked Certificates                        ││
│  │                                                         ││
│  │  ┌─────────────────┐  ┌─────────────────┐               ││
│  │  │ MSPO Certificate│  │ Organic Cert    │               ││
│  │  │ Valid until     │  │ Valid until     │               ││
│  │  │ 2025-12-31     │  │ 2025-06-30     │               ││
│  │  └─────────────────┘  └─────────────────┘               ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│                    [Scan Another Product]                   │
└─────────────────────────────────────────────────────────────┘
```

## 4. Responsive Design Specifications

### 4.1 Breakpoints

```css
/* Mobile First Approach */
xs: 0px - 599px    (Mobile phones)
sm: 600px - 959px  (Tablets)
md: 960px - 1279px (Small desktops)
lg: 1280px - 1919px (Large desktops)
xl: 1920px+        (Extra large screens)
```

### 4.2 Mobile Adaptations

#### 4.2.1 Navigation
- **Mobile**: Hamburger menu with slide-out drawer
- **Tablet**: Collapsed menu with dropdown
- **Desktop**: Full horizontal navigation

#### 4.2.2 Cards and Layout
- **Mobile**: Single column, full-width cards
- **Tablet**: Two-column grid for cards
- **Desktop**: Multi-column layouts with optimal spacing

#### 4.2.3 Forms
- **Mobile**: Stacked form fields, large touch targets
- **Tablet**: Two-column form layouts where appropriate
- **Desktop**: Multi-column forms with optimal field grouping

### 4.3 Touch Interactions

#### 4.3.1 Touch Targets
- **Minimum Size**: 44px x 44px (iOS HIG standard)
- **Recommended Size**: 48px x 48px (Material Design)
- **Spacing**: Minimum 8px between touch targets

#### 4.3.2 Gestures
- **Swipe**: Card navigation and drawer interactions
- **Pinch/Zoom**: Image and document viewing
- **Long Press**: Context menus and additional options
- **Pull to Refresh**: Data refresh functionality

## 5. Accessibility Design

### 5.1 Color and Contrast

#### 5.1.1 Contrast Ratios
- **Normal Text**: 4.5:1 minimum contrast ratio
- **Large Text**: 3:1 minimum contrast ratio
- **UI Components**: 3:1 minimum contrast ratio
- **Status Indicators**: Color + text/icon for clarity

#### 5.1.2 Color Blindness Considerations
- **Status Colors**: Use color + icons/text labels
- **Charts/Graphs**: Use patterns and textures in addition to color
- **Links**: Underlined in addition to color differentiation

### 5.2 Typography and Readability

#### 5.2.1 Text Size
- **Minimum Body Text**: 16px for comfortable reading
- **Scalable Text**: Support for browser zoom up to 200%
- **Line Height**: 1.5x font size for optimal readability

#### 5.2.2 Font Choices
- **High Contrast**: Clear distinction between characters
- **Readable**: Simple, uncluttered font designs
- **Consistent**: Uniform font usage throughout application

### 5.3 Interactive Elements

#### 5.3.1 Focus Management
- **Visible Focus**: Clear focus indicators for keyboard navigation
- **Logical Tab Order**: Intuitive tab sequence through interface
- **Skip Links**: Quick navigation to main content areas

#### 5.3.2 Screen Reader Support
- **Semantic HTML**: Proper heading structure and landmarks
- **ARIA Labels**: Descriptive labels for interactive elements
- **Alt Text**: Descriptive alternative text for images
- **Live Regions**: Announce dynamic content changes

## 6. Animation and Micro-interactions

### 6.1 Animation Principles

- **Purposeful**: Animations should enhance usability, not distract
- **Consistent**: Uniform timing and easing across the application
- **Performant**: 60fps animations with minimal performance impact
- **Accessible**: Respect user preferences for reduced motion

### 6.2 Animation Specifications

#### 6.2.1 Timing Functions
```css
/* Standard easing curves */
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)    /* Standard */
ease-out: cubic-bezier(0, 0, 0.2, 1)         /* Entrance */
ease-in: cubic-bezier(0.4, 0, 1, 1)          /* Exit */
```

#### 6.2.2 Duration Standards
- **Micro-interactions**: 150ms (button hover, focus)
- **Page transitions**: 300ms (navigation, modal)
- **Complex animations**: 500ms (card flip, data loading)
- **Loading states**: Variable (progress indicators)

### 6.3 Micro-interaction Examples

#### 6.3.1 Button Interactions
- **Hover**: Subtle elevation increase (2px shadow)
- **Active**: Slight scale reduction (0.98x)
- **Loading**: Spinner with disabled state
- **Success**: Green checkmark with fade-in

#### 6.3.2 Card Interactions
- **Hover**: Gentle elevation increase
- **Click**: Brief scale animation (0.98x)
- **Loading**: Skeleton animation for content
- **Error**: Shake animation with red border

#### 6.3.3 Form Interactions
- **Focus**: Border color change and label animation
- **Validation**: Real-time feedback with color changes
- **Success**: Green checkmark with slide-in animation
- **Error**: Red border with shake animation

## 7. Loading States and Feedback

### 7.1 Loading Indicators

#### 7.1.1 Skeleton Screens
- **Card Loading**: Animated placeholder rectangles
- **List Loading**: Repeated skeleton card patterns
- **Form Loading**: Placeholder text and input fields
- **Image Loading**: Blur-to-sharp transition effect

#### 7.1.2 Progress Indicators
- **Linear Progress**: For file uploads and long operations
- **Circular Progress**: For page loading and data fetching
- **Step Progress**: For multi-step processes (batch creation)
- **Percentage Progress**: For operations with known completion

### 7.2 Error States

#### 7.2.1 Error Messages
- **Inline Errors**: Field-specific validation messages
- **Toast Notifications**: Non-blocking error alerts
- **Modal Errors**: Critical error dialogs
- **Page Errors**: Full-page error states with recovery options

#### 7.2.2 Empty States
- **No Data**: Helpful illustrations with action prompts
- **Search Results**: Clear "no results found" messaging
- **Network Errors**: Retry options with clear explanations
- **Permission Denied**: Clear access restriction messaging

## 8. Cultural and Localization Considerations

### 8.1 Malaysian Cultural Elements

#### 8.1.1 Visual Design
- **Green Emphasis**: Prominent use of green reflecting Islamic and environmental values
- **Nature Imagery**: Subtle use of palm oil, rice, and agricultural imagery
- **Respectful Iconography**: Appropriate symbols for Halal certification

#### 8.1.2 Language Support
- **Primary Language**: English (international accessibility)
- **Secondary Language**: Bahasa Malaysia (local accessibility)
- **RTL Support**: Future support for Arabic script if needed

### 8.2 Religious Sensitivity

#### 8.2.1 Halal Certification
- **Clear Indicators**: Prominent Halal certification badges
- **Trust Elements**: Visual cues that reinforce authenticity
- **Transparency**: Clear display of certification details and validity

#### 8.2.2 Color Symbolism
- **Green**: Associated with Islam and nature
- **Avoid**: Red for negative states (use orange instead)
- **Neutral**: Blue for technology and trust

---

**Document Control:**
- Created: January 2025
- Version: 1.0
- Next Review: March 2025
- Owner: BorneoTrace Development Team
