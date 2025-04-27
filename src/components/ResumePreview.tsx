import React from 'react';
import { ResumeData } from '@/types';
import Link from 'next/link';
import { Button, Card, Badge, Text, Heading, Box, Flex, Stack, Icon, HStack, VStack } from '@chakra-ui/react';
import { FiExternalLink, FiEye, FiFileText, FiFilePlus } from 'react-icons/fi';

interface ResumePreviewProps {
  resume: ResumeData;
  showFullContent?: boolean;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resume, showFullContent = false }) => {
  // Create a truncated version of the content for preview
  const truncatedContent = resume.content?.length > 180 
    ? `${resume.content.substring(0, 180)}...` 
    : resume.content;
  
  // Determine if we have a PDF available
  const hasPdf = !!resume.pdfUrl;
  
  return (
    <Card p={5} mb={4} shadow="md" borderRadius="md">
      <Flex direction="column" h="100%">
        {/* Header section */}
        <Flex justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Heading as="h3" size="md" mb={2}>
            {resume.title}
          </Heading>
          <Box>
            <Badge colorScheme="blue" mr={2}>
              {resume.experienceLevel}
            </Badge>
            <Badge colorScheme="purple">
              {resume.role || 'Resume'}
            </Badge>
          </Box>
        </Flex>
        
        {resume.author && (
          <Text fontSize="sm" mb={2} color="gray.600">
            By: {resume.author}
          </Text>
        )}
        
        {/* Main content section */}
        <Flex direction={{ base: "column", md: "row" }} flex="1">
          {/* Left side: Skills and brief content */}
          <Box flex="1" mr={{ base: 0, md: 4 }} mb={{ base: 4, md: 0 }}>
            {resume.skills && resume.skills.length > 0 && (
              <Box mb={4}>
                <Text fontWeight="bold" mb={1}>Skills:</Text>
                <Flex flexWrap="wrap" gap={1}>
                  {resume.skills.slice(0, 5).map((skill, idx) => (
                    <Badge key={idx} colorScheme="green" mr={1} mb={1}>
                      {skill}
                    </Badge>
                  ))}
                  {resume.skills.length > 5 && (
                    <Badge colorScheme="green" mr={1} mb={1}>
                      +{resume.skills.length - 5} more
                    </Badge>
                  )}
                </Flex>
              </Box>
            )}
            
            {resume.content && !hasPdf && (
              <Box mb={4}>
                <Text fontWeight="bold" mb={1}>Preview:</Text>
                <Text fontSize="sm" noOfLines={3} color="gray.700">
                  {truncatedContent}
                </Text>
              </Box>
            )}
          </Box>
          
          {/* Right side: Action buttons */}
          <VStack spacing={3} align="stretch" width={{ base: "100%", md: "auto" }}>
            {/* PDF Button */}
            {hasPdf && (
              <Button 
                as="a" 
                href={resume.pdfUrl} 
                target="_blank" 
                size="md" 
                colorScheme="blue" 
                leftIcon={<Icon as={FiFilePlus} />}
                width="100%"
              >
                View PDF
              </Button>
            )}
            
            <Link href={`/resume/${resume.id}`} passHref>
              <Button 
                size="md" 
                colorScheme={hasPdf ? "gray" : "blue"} 
                variant={hasPdf ? "outline" : "solid"}
                leftIcon={<Icon as={FiEye} />}
                width="100%"
              >
                View Details
              </Button>
            </Link>
          </VStack>
        </Flex>
        
        {/* Footer section */}
        <HStack mt={4} justify="space-between" flexWrap="wrap">
          {resume.educationLevel && (
            <Badge colorScheme="orange" mr={1} mb={1}>
              {resume.educationLevel} degree
            </Badge>
          )}
          
          {resume.companies && resume.companies.length > 0 && (
            <Text fontSize="xs" color="gray.600">
              Companies: {resume.companies.slice(0, 2).join(', ')}
              {resume.companies.length > 2 ? ` +${resume.companies.length - 2} more` : ''}
            </Text>
          )}
          
          <Text fontSize="xs" color="gray.500">
            Updated: {new Date(resume.updatedAt || Date.now()).toLocaleDateString()}
          </Text>
        </HStack>
      </Flex>
    </Card>
  );
};

export default ResumePreview; 