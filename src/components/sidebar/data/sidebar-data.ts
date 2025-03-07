import {
  IconChecklist,
  IconUnlink,
  IconBookmarks,
  IconCodeDots,
  IconAppWindow,
  IconArrowsExchange,
  IconTool,
  IconPhotoVideo,
  IconBlocks,
  IconNetwork,
  IconBook2,
  IconPlus
} from '@tabler/icons-react'
import { type LoadItemsFunction, type SidebarData } from '../types'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../../database/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Function to fetch parent notes
const fetchParentNotes: LoadItemsFunction = async () => {
  return []; // Initial empty state, we'll use subscribe for real data
};

// Add real-time subscription support
fetchParentNotes.subscribe = async (callback) => {
  const auth = getAuth();
  
  // Set up auth state listener
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      callback([]);
      return;
    }

    // Set up notes listener once we have auth
    const q = query(
      collection(db, 'notes'),
      where('created_by', '==', user.uid),
      where('isParent', '==', true),
      orderBy('updatedAt', 'desc')
    );
    
    const unsubscribeNotes = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        title: doc.data().title || 'Untitled Note',
        url: `/app/notes?id=${doc.id}`,
        icon: undefined
      }));
      callback(items);
    }, (error) => {
      console.error('Error in notes subscription:', error);
      callback([]);
    });

    // Store the notes unsubscribe function
    return () => {
      unsubscribeNotes();
    };
  });

  // Return a cleanup function that handles both subscriptions
  return () => {
    unsubscribeAuth();
  };
};

export const sidebarData: SidebarData = {
  user: {
    name: 'User',
    email: 'User@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navGroups: [
    {
      title: 'General Tools',
      items: [
        {
          title: 'Tasks',
          url: '/app/to-do',
          icon: IconChecklist,
        },
        {
          title: 'Url Shortener',
          url: '/app/url-shortener',
          icon: IconUnlink,
        },
        {
          title: 'Notes',
          icon: IconBook2,
          items: [
            {
              title: 'New Note',
              url: '/app/notes',
              icon: IconPlus
            },
            // Parent notes will be dynamically added here
          ],
          loadItems: fetchParentNotes
        },
        {
          title: 'Bookmarks Manager',
          url: '#',
          badge: '3',
          icon: IconBookmarks,
        },
        {
          title: 'Json Viewer',
          url: '#',
          icon: IconCodeDots,
        },
      ],
    },
    {
      title: 'Specific Tools',
      items: [
        {
          title: 'Util Tools',
          icon: IconTool,
          items: [
            {
              title: 'UUID Generator',
              url: '/app/uuid-generator',
            },
            {
              title: 'ULID Generator',
              url: '/app/ulid-generator',
            },
            {
              title: 'Encrypt / Decrypt Text',
              url: '/app/encrypt-decrypt-text',
            },
            {
              title: 'Token Generator',
              url: '/app/token-generator',
            },
            {
              title: 'Hash Generator',
              url: '/app/hash-generator',
            },
            {
              title: 'Bcrypt',
              url: '/app/bcrypt',
            },
          ],
        },
        {
          title: 'Converters',
          icon: IconArrowsExchange,
          items: [
            {
              title: 'JSON to XML',
              url: '/app/json-xml',
            },
            {
              title: 'JSON to TOML',
              url: '/app/json-toml',
            },
            {
              title: 'JSON to YAML',
              url: '/app/json-yaml',
            },
            {
              title: 'JSON to CSV',
              url: '/app/json-csv',
            },
            {
              title: 'TOML to JSON',
              url: '/app/toml-json',
            },
            {
              title: 'TOML to YAML',
              url: '/app/toml-yaml',
            },
            {
              title: 'XML to JSON',
              url: '/app/xml-json',
            },
            {
              title: 'YAML to JSON',
              url: '/app/yaml-json',
            },
            {
              title: 'YAML to TOML',
              url: '/app/yaml-toml',
            },
          ],
        },
        {
          title: 'Web Tools',
          icon: IconAppWindow,
          items: [
            {
              title: 'Encode/Decode URL',
              url: '/app/url-encoder',
            },
            {
              title: 'Escape HTML Entities',
              url: '/app/html-entity-converter',
            },
            {
              title: 'URL Parser',
              url: '/app/url-parser',
            },
            {
              title: 'Device Information',
              url: '/app/device-info',
            },
            {
              title: 'OTP Generator',
              url: '/app/otp-generator',
            },
            {
              title: 'JWT Parser',
              url: '/app/jwt-parser',
            },
            {
              title: 'HTTP Status Codes',
              url: '/app/http-status-codes',
            },
            {
              title: 'JSON Diff',
              url: '/app/json-diff',
            },
          ],
        },
        {
          title: 'Media Tools',
          icon: IconPhotoVideo,
          items: [
            {
              title: 'QR Code Generator',
              url: '/app/qr-code-generator',
            },
            {
              title: 'Wifi QR Code Generator',
              url: '/app/wifi-qr-generator',
            },
          ],
        },
        {
          title: 'Development',
          icon: IconBlocks,
          items: [
            {
              title: 'Git Commands',
              url: '/app/git-commands',
            },
            {
              title: 'Crontab Generator',
              url: '/app/crontab-generator',
            },
            {
              title: 'Chmod Calculator',
              url: '/app/chmod-calculator',
            },
            {
              title: 'Regex Cheatsheet',
              url: '/app/regex-cheatsheet',
            },
          ],
        },
        {
          title: 'Network',
          icon: IconNetwork,
          items: [
            {
              title: 'IPv4 Subnet Calculator',
              url: '/app/ipv4-subnet-calculator',
            },
            {
              title: 'IPv4 Address Converter',
              url: '/app/ipv4-address-converter',
            },
          ],
        },
      ],
    },
  ],
}
