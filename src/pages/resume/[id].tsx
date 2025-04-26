import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ResumeData } from '@/types';
import { Button, Container, VStack, Heading, Text, Badge, Box, Flex, Divider, Icon, Alert, AlertIcon, Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { FiExternalLink, FiHome, FiFilePlus, FiFileText, FiDownload } from 'react-icons/fi';
import Link from 'next/link';

export default function ResumeDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchResume = async () => {
      try {
        setLoading(true);
        const resumeRef = doc(db, 'resumes', id as string);
        const resumeSnap = await getDoc(resumeRef);

        if (resumeSnap.exists()) {
          setResume(resumeSnap.data() as ResumeData);
        } else {
          setError('Resume not found');
        }
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Error loading the resume');
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, [id]);

  if (loading) {
    return (
      <Container maxW="container.lg" py={10}>
        <Text>Loading resume details...</Text>
      </Container>
    );
  }

  if (error || !resume) {
    return (
      <Container maxW="container.lg" py={10}>
        <VStack spacing={4} align="stretch">
          <Text color="red.500">{error || 'Resume not found'}</Text>
          <Link href="/" passHref>
            <Button leftIcon={<Icon as={FiHome} />} colorScheme="blue">
              Back to Home
            </Button>
          </Link>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={6}>
      <VStack spacing={6} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <VStack align="flex-start" spacing={1}>
            <Heading as="h1" size="xl">
              {resume.title}
            </Heading>
            <Flex>
              <Badge colorScheme="blue" mr={2} fontSize="0.9em">
                {resume.experienceLevel}
              </Badge>
              <Badge colorScheme="purple" fontSize="0.9em">
                {resume.role || 'Resume'}
              </Badge>
            </Flex>
          </VStack>
          <Link href="/" passHref>
            <Button leftIcon={<Icon as={FiHome} />} size="sm" colorScheme="gray" variant="outline">
              Back
            </Button>
          </Link>
        </Flex>

        {resume.author && (
          <Text fontSize="md" color="gray.600">
            By: {resume.author}
          </Text>
        )}

        <Tabs variant="enclosed" colorScheme="blue" size="md">
          <TabList>
            <Tab>PDF View</Tab>
            <Tab>Text & Details</Tab>
          </TabList>
          
          <TabPanels>
            {/* PDF Viewer Panel */}
            <TabPanel p={0} pt={5}>
              {resume.pdfUrl ? (
                <VStack spacing={4} align="stretch">
                  <Box 
                    as="iframe"
                    src={`${resume.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                    width="100%"
                    height="800px"
                    borderWidth="1px"
                    borderRadius="md"
                    borderColor="gray.200"
                  />
                  <Flex justifyContent="center">
                    <Button 
                      as="a" 
                      href={resume.pdfUrl} 
                      target="_blank" 
                      size="md" 
                      colorScheme="blue" 
                      leftIcon={<Icon as={FiDownload} />}
                      mr={2}
                    >
                      Download PDF
                    </Button>
                    <Button 
                      as="a" 
                      href={resume.pdfUrl} 
                      target="_blank" 
                      size="md" 
                      colorScheme="gray" 
                      leftIcon={<Icon as={FiExternalLink} />}
                      variant="outline"
                    >
                      Open in New Tab
                    </Button>
                  </Flex>
                </VStack>
              ) : (
                <Alert
                  status="info"
                  variant="subtle"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  textAlign="center"
                  height="400px"
                  borderRadius="md"
                >
                  <AlertIcon boxSize="40px" mr={0} />
                  <Heading as="h3" size="md" mt={4} mb={2}>
                    PDF Not Available
                  </Heading>
                  <Text>
                    This resume doesn't have a PDF version available.
                    <br />Please check the Text & Details tab instead.
                  </Text>
                </Alert>
              )}
            </TabPanel>
            
            {/* Text and Details Panel */}
            <TabPanel p={0} pt={5}>
              <VStack spacing={6} align="stretch">
                {resume.skills && resume.skills.length > 0 && (
                  <Box>
                    <Heading as="h3" size="md" mb={2}>
                      Skills
                    </Heading>
                    <Flex flexWrap="wrap" gap={2}>
                      {resume.skills.map((skill, idx) => (
                        <Badge key={idx} colorScheme="green" fontSize="0.9em" p={1}>
                          {skill}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}

                {resume.education && (
                  <Box>
                    <Heading as="h3" size="md" mb={2}>
                      Education
                    </Heading>
                    <Text>{resume.education}</Text>
                    {resume.educationLevel && (
                      <Badge colorScheme="orange" fontSize="0.9em" mt={1}>
                        {resume.educationLevel} degree
                      </Badge>
                    )}
                  </Box>
                )}

                {resume.companies && resume.companies.length > 0 && (
                  <Box>
                    <Heading as="h3" size="md" mb={2}>
                      Companies
                    </Heading>
                    <Flex flexWrap="wrap" gap={2}>
                      {resume.companies.map((company, idx) => (
                        <Badge key={idx} colorScheme="teal" fontSize="0.9em" p={1}>
                          {company}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}

                {resume.interviews && resume.interviews.length > 0 && (
                  <Box>
                    <Heading as="h3" size="md" mb={2}>
                      Interviews
                    </Heading>
                    <Flex flexWrap="wrap" gap={2}>
                      {resume.interviews.map((company, idx) => (
                        <Badge key={idx} colorScheme="cyan" fontSize="0.9em" p={1}>
                          {company}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}

                {resume.offers && resume.offers.length > 0 && (
                  <Box>
                    <Heading as="h3" size="md" mb={2}>
                      Offers
                    </Heading>
                    <Flex flexWrap="wrap" gap={2}>
                      {resume.offers.map((company, idx) => (
                        <Badge key={idx} colorScheme="pink" fontSize="0.9em" p={1}>
                          {company}
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                )}

                {resume.content && (
                  <>
                    <Divider />
                    <Box>
                      <Heading as="h3" size="md" mb={3}>
                        Resume Text Content
                      </Heading>
                      <Box 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        bg="gray.50"
                        whiteSpace="pre-wrap"
                        fontSize="sm"
                        maxHeight="500px"
                        overflowY="auto"
                      >
                        {resume.content}
                      </Box>
                    </Box>
                  </>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Text fontSize="xs" color="gray.500" mt={4}>
          Last updated: {new Date(resume.updatedAt || Date.now()).toLocaleDateString()}
        </Text>
      </VStack>
    </Container>
  );
} 